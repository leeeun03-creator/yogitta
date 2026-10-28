import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  createSpace,
  dragFloorCm,
  dragScreen,
  floorBox,
  pressCm,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const drag = (page: Page, from: Cm, to: Cm, isMobile: boolean, beforeUp?: () => Promise<void>) =>
  dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);
const label = (page: Page) => page.getByTestId("length-label");

async function labelBox(page: Page) {
  const box = await label(page).boundingBox();
  if (!box) throw new Error("길이 표시가 보이지 않는다");
  return box;
}

test.describe("길이 표시", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("직선: 끄는 동안 지금 길이가 보이고, 떼면 사라진다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile, async () => {
      await expect(label(page)).toHaveText("3.0 m");
    });
    await expect(label(page)).toHaveCount(0);
  });

  test("직선: 대각선은 실제 길이를 보인다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 50 }, { x: 400, y: 450 }, isMobile, async () => {
      await expect(label(page)).toHaveText("5.0 m");
    });
  });

  test("연속선: 지금 그리는 선분 길이만 보인다", async ({ page, isMobile }) => {
    await chooseTool(page, "연속선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile);
    await drag(page, { x: 400, y: 100 }, { x: 400, y: 300 }, isMobile, async () => {
      await expect(label(page)).toHaveText("2.0 m");
    });
  });

  test("사각형: 끄는 동안 '가로 × 세로'가 가운데에 보인다", async ({ page, isMobile }) => {
    await chooseTool(page, "사각형");
    await drag(page, { x: 100, y: 50 }, { x: 400, y: 300 }, isMobile, async () => {
      await expect(label(page)).toHaveText("3.0 × 2.5 m");
      const box = await labelBox(page);
      const center = await cmToScreen(page, FLOOR, { x: 250, y: 175 });
      expect(Math.abs(box.x + box.width / 2 - center.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(box.y + box.height / 2 - center.y)).toBeLessThanOrEqual(2);
    });
    await expect(label(page)).toHaveCount(0);
  });

  test("두 번 누르기: 첫 점 뒤 커서를 옮기면 길이가 따라온다", async ({ page, isMobile }) => {
    test.skip(isMobile, "커서 올리기는 마우스에서만");
    await chooseTool(page, "직선");
    await pressCm(page, FLOOR, [{ x: 100, y: 100 }], false);
    await expect(label(page)).toHaveCount(0); // 커서가 첫 점 자리 = 길이 0
    const to = await cmToScreen(page, FLOOR, { x: 100, y: 220 });
    await page.mouse.move(to.x, to.y, { steps: 3 });
    await expect(label(page)).toHaveText("1.2 m");
  });

  test("엣지: 세로선은 글자가 선 왼쪽에 떨어져 겹치지 않는다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 300, y: 50 }, { x: 300, y: 400 }, isMobile, async () => {
      const box = await labelBox(page);
      const line = await cmToScreen(page, FLOOR, { x: 300 - 6, y: 0 }); // 벽 왼쪽 가장자리
      expect(box.x + box.width).toBeLessThan(line.x);
    });
  });

  test("엣지: 화면 위 가장자리의 선은 글자가 화면 안에 들어온다", async ({ page, isMobile }) => {
    const svg = await page.getByRole("img", { name: /2D 평면도/ }).boundingBox();
    if (!svg) throw new Error("2D 평면도가 보이지 않는다");
    // 선택 도구로 바닥 위쪽 가장자리가 화면 맨 위 4px에 오게 옮긴다
    await chooseTool(page, "선택");
    const top = await floorBox(page);
    const from = { x: top.x + top.width / 2, y: top.y + top.height / 2 };
    await dragScreen(page, from, { x: from.x, y: from.y - (top.y - svg.y - 4) }, isMobile);
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 0 }, { x: 500, y: 0 }, isMobile, async () => {
      const box = await labelBox(page);
      expect(box.y).toBeGreaterThanOrEqual(svg.y);
      expect(box.y + box.height).toBeLessThanOrEqual(svg.y + svg.height);
    });
  });

  test("엣지: 확대해도 글자가 화면에서 같은 크기다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휠 줌은 데스크톱에서만");
    await chooseTool(page, "직선");
    let before = 0;
    await drag(page, { x: 100, y: 200 }, { x: 300, y: 200 }, false, async () => {
      before = (await labelBox(page)).height;
    });
    const center = await cmToScreen(page, FLOOR, { x: 300, y: 225 });
    await page.mouse.move(center.x, center.y);
    for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -100);
    await drag(page, { x: 250, y: 200 }, { x: 350, y: 200 }, false, async () => {
      // 확대 배율(2배쯤)대로 커지면 50px이 넘는다. 2px은 배율마다 글자를 반올림해 그리는 차이
      expect(Math.abs((await labelBox(page)).height - before)).toBeLessThanOrEqual(2);
    });
  });

  test("엣지: 마우스로 끌어도 치수·길이 글자가 선택되지 않는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "글자 선택은 마우스 끌기에서만");
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 100 }, { x: 100, y: 400 }, false, async () => {
      expect(await page.evaluate(() => window.getSelection()?.toString() ?? "")).toBe("");
    });
    // 선택 도구로 치수 글자를 가로질러 끌어도 같다
    await chooseTool(page, "선택");
    const top = await floorBox(page);
    await dragScreen(
      page,
      { x: top.x - 20, y: top.y - 30 },
      { x: top.x + 200, y: top.y + 60 },
      false,
    );
    expect(await page.evaluate(() => window.getSelection()?.toString() ?? "")).toBe("");
  });

  test("스크린샷을 남긴다", async ({ page, isMobile }, testInfo) => {
    await chooseTool(page, "연속선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile);
    await drag(page, { x: 400, y: 100 }, { x: 400, y: 330 }, isMobile, async () => {
      await page.screenshot({ path: testInfo.outputPath("length-label.png"), fullPage: true });
    });
  });
});
