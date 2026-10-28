import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  createSpace,
  dragFloorCm,
  dragScreen,
  floorBox,
  wallPoints,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const dragCm = (page: Page, from: Cm, to: Cm, isMobile: boolean, beforeUp?: () => Promise<void>) =>
  dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);

function expectRect(
  actual: number[][] | undefined,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  const expected = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
  ];
  expect(actual).toHaveLength(4);
  expected.forEach(([x, y], i) => {
    expect(Math.abs((actual?.[i]?.[0] ?? NaN) - (x ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((actual?.[i]?.[1] ?? NaN) - (y ?? 0))).toBeLessThanOrEqual(1);
  });
}

test.describe("사각형 도구", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "사각형");
  });

  test("끌어서 놓으면 점 4개의 닫힌 벽이 된다", async ({ page, isMobile }) => {
    await dragCm(page, { x: 100, y: 50 }, { x: 400, y: 300 }, isMobile);
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expectRect(walls[0], 100, 50, 400, 300);
    await expect(page.getByTestId("wall").locator("polygon")).toHaveCount(1);
    await expect(page.getByTestId("joint")).toHaveCount(4);
  });

  test("끄는 동안 미리보기 사각형이 보이고, 놓으면 사라진다", async ({ page, isMobile }) => {
    await dragCm(page, { x: 100, y: 50 }, { x: 400, y: 300 }, isMobile, async () => {
      await expect(page.getByTestId("draft")).toBeVisible();
      const points = ((await page.getByTestId("draft").getAttribute("points")) ?? "").split(" ");
      expect(points).toHaveLength(5); // 닫는 점 포함
    });
    await expect(page.getByTestId("draft")).toHaveCount(0);
  });

  test("엣지: 거꾸로(오른쪽 아래 → 왼쪽 위) 끌어도 같은 사각형", async ({ page, isMobile }) => {
    await dragCm(page, { x: 400, y: 300 }, { x: 100, y: 50 }, isMobile);
    expectRect((await wallPoints(page))[0], 100, 50, 400, 300);
  });

  test("엣지: 가로나 세로가 0이면 만들지 않는다", async ({ page, isMobile }) => {
    await dragCm(page, { x: 200, y: 50 }, { x: 200, y: 300 }, isMobile);
    await dragCm(page, { x: 100, y: 200 }, { x: 500, y: 200 }, isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("엣지: 바닥 밖으로 끌면 바닥 경계까지", async ({ page, isMobile }) => {
    const floor = await floorBox(page);
    const start = await cmToScreen(page, FLOOR, { x: 300, y: 200 });
    const outside = { x: floor.x + floor.width + 30, y: floor.y + floor.height + 30 };
    await dragScreen(page, start, outside, isMobile);
    expectRect((await wallPoints(page))[0], 300, 200, 600, 450);
  });

  test("엣지: 끄는 중에 Esc를 누르면 취소된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await dragCm(page, { x: 100, y: 50 }, { x: 400, y: 300 }, false, async () => {
      await page.keyboard.press("Escape");
    });
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(page.getByTestId("draft")).toHaveCount(0);
  });

  test("스크린샷을 남긴다", async ({ page, isMobile }, testInfo) => {
    await dragCm(page, { x: 0, y: 0 }, { x: 600, y: 450 }, isMobile);
    await dragCm(page, { x: 380, y: 0 }, { x: 600, y: 200 }, isMobile);
    await page.screenshot({ path: testInfo.outputPath("rect-tool.png"), fullPage: true });
  });
});
