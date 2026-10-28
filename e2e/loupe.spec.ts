import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  createSpace,
  dragFloorCm,
  dragScreen,
  floorBox,
  plan,
  wallPoints,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const drag = (page: Page, from: Cm, to: Cm, isMobile: boolean, beforeUp?: () => Promise<void>) =>
  dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);
const loupe = (page: Page) => page.getByTestId("loupe");

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("보이지 않는다");
  return box;
}

test.describe("돋보기 (터치)", () => {
  test.skip(({ isMobile, browserName }) => !isMobile || browserName !== "chromium", "CDP 터치");

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("끄는 동안 손가락 위에 뜨고, 떼면 사라진다. 찍히는 좌표는 그대로다", async ({ page }) => {
    await chooseTool(page, "직선");
    const finger = await cmToScreen(page, FLOOR, { x: 400, y: 300 });
    await drag(page, { x: 100, y: 300 }, { x: 400, y: 300 }, true, async () => {
      await expect(loupe(page)).toBeVisible();
      const box = await boxOf(loupe(page));
      expect(box.y + box.height).toBeLessThan(finger.y); // 손가락에 가리지 않게 위에
      expect(Math.abs(box.x + box.width / 2 - finger.x)).toBeLessThanOrEqual(1);
    });
    await expect(loupe(page)).toHaveCount(0);
    expect(await wallPoints(page)).toEqual([
      [
        [100, 300],
        [400, 300],
      ],
    ]);
  });

  test("손가락 아래 붙을 점을 가운데에 두고 미리보기 선·붙을 곳 표시를 크게 보여준다", async ({
    page,
  }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 300 }, { x: 402, y: 298 }, true, async () => {
      const [x, y, width, height] = (
        (await loupe(page).locator("svg").getAttribute("viewBox")) ?? ""
      )
        .split(" ")
        .map(Number);
      // 붙을 점(400, 300)이 가운데
      expect((x ?? NaN) + (width ?? NaN) / 2).toBeCloseTo(400);
      expect((y ?? NaN) + (height ?? NaN) / 2).toBeCloseTo(300);
      // 2D 평면도보다 2배 크게: 돋보기 120px에 보이는 cm = 평면도 60px에 보이는 cm
      const floor = await floorBox(page);
      expect(width).toBeCloseTo((60 * FLOOR.w) / floor.width, 0);
      await expect(loupe(page).getByTestId("draft")).toHaveCount(1);
      await expect(loupe(page).getByTestId("snap-grid")).toHaveCount(1);
    });
  });

  test("사각형을 끌 때도 뜬다", async ({ page }) => {
    await chooseTool(page, "사각형");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 300 }, true, async () => {
      await expect(loupe(page)).toBeVisible();
    });
    await expect(loupe(page)).toHaveCount(0);
  });

  test("엣지: 선택 도구로 끌 때는 뜨지 않는다", async ({ page }) => {
    await chooseTool(page, "선택");
    await drag(page, { x: 100, y: 100 }, { x: 300, y: 300 }, true, async () => {
      await expect(loupe(page)).toHaveCount(0);
    });
  });

  test("엣지: 2D 평면도 위쪽 가장자리에서는 돋보기가 영역 안으로 옮겨진다", async ({ page }) => {
    const area = await boxOf(page.getByRole("img", { name: /^2D 평면도,/ }));
    await chooseTool(page, "직선");
    const near = { x: area.x + 40, y: area.y + 20 }; // 위로 띄울 자리가 없는 곳
    const start = { x: area.x + 200, y: area.y + 20 };
    await dragScreen(page, start, near, true, async () => {
      const box = await boxOf(loupe(page));
      expect(box.y).toBeGreaterThanOrEqual(area.y);
      expect(box.x).toBeGreaterThanOrEqual(area.x);
      expect(box.x + box.width).toBeLessThanOrEqual(area.x + area.width);
      // 손가락 옆으로 비켜서 손가락을 덮지 않는다
      expect(box.x).toBeGreaterThan(near.x);
    });
  });

  test("엣지: 두 번째 손가락이 닿으면 사라진다", async ({ page }) => {
    await chooseTool(page, "직선");
    const a = await cmToScreen(page, FLOOR, { x: 200, y: 300 });
    const b = await cmToScreen(page, FLOOR, { x: 400, y: 300 });
    const cdp = await page.context().newCDPSession(page);
    const send = (type: "touchStart" | "touchMove" | "touchEnd", points: Cm[]) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: points.map((p, id) => ({ ...p, id })),
      });
    await send("touchStart", [a]);
    await send("touchMove", [{ x: a.x + 20, y: a.y }]);
    await expect(loupe(page)).toBeVisible();
    await send("touchStart", [{ x: a.x + 20, y: a.y }, b]);
    await expect(loupe(page)).toHaveCount(0);
    await send("touchEnd", []);
  });

  test("스크린샷을 남긴다", async ({ page }, testInfo) => {
    await chooseTool(page, "연속선");
    await drag(page, { x: 100, y: 300 }, { x: 400, y: 300 }, true);
    await drag(page, { x: 400, y: 300 }, { x: 400, y: 150 }, true, async () => {
      await page.screenshot({ path: testInfo.outputPath("loupe.png"), fullPage: true });
    });
  });
});

test.describe("돋보기 (마우스)", () => {
  test.skip(({ isMobile }) => isMobile, "마우스는 데스크톱에서만");

  test("엣지: 마우스로 끌 때는 뜨지 않는다", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 300 }, false, async () => {
      await expect(plan(page).getByTestId("draft")).toHaveCount(1);
      await expect(loupe(page)).toHaveCount(0);
    });
  });
});
