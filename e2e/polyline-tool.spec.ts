import { expect, test, type Page } from "@playwright/test";
import { chooseTool, cmToScreen, createSpace, wallPoints } from "./helpers";

const FLOOR = { w: 600, h: 450 };
const A = { x: 100, y: 100 };
const B = { x: 400, y: 100 };
const C = { x: 400, y: 300 };

async function pressAt(page: Page, cm: { x: number; y: number }, isMobile: boolean) {
  const { x, y } = await cmToScreen(page, FLOOR, cm);
  if (isMobile) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}
async function pressAll(page: Page, points: { x: number; y: number }[], isMobile: boolean) {
  for (const point of points) await pressAt(page, point, isMobile);
}
async function wallShapes(page: Page) {
  return page
    .getByTestId("wall")
    .locator("polyline, polygon")
    .evaluateAll((shapes) => shapes.map((shape) => shape.tagName));
}
function expectNear(actual: number[][] | undefined, expected: { x: number; y: number }[]) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(({ x, y }, index) => {
    expect(Math.abs((actual?.[index]?.[0] ?? NaN) - x)).toBeLessThanOrEqual(1);
    expect(Math.abs((actual?.[index]?.[1] ?? NaN) - y)).toBeLessThanOrEqual(1);
  });
}

test.describe("연속선 도구", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "연속선");
  });

  test("누를 때마다 점이 이어지고, 마지막 점을 다시 누르면 열린 벽으로 끝난다", async ({
    page,
    isMobile,
  }) => {
    await pressAll(page, [A, B, C], isMobile);
    expect(await wallPoints(page)).toHaveLength(0); // 아직 그리는 중
    await pressAt(page, C, isMobile);
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expectNear(walls[0], [A, B, C]);
    expect(await wallShapes(page)).toEqual(["polyline"]);
    await expect(page.getByTestId("draft")).toHaveCount(0);
  });

  test("첫 점을 다시 누르면 닫힌 벽이 된다", async ({ page, isMobile }) => {
    await pressAll(page, [A, B, C, A], isMobile);
    expectNear((await wallPoints(page))[0], [A, B, C]);
    expect(await wallShapes(page)).toEqual(["polygon"]);
  });

  test("Enter로 끝내고, Backspace는 마지막 점을 취소한다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await pressAll(page, [A, B, C], false);
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Enter");
    expectNear((await wallPoints(page))[0], [A, B]);
  });

  test("엣지: Esc를 누르면 그리던 연속선이 취소된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await pressAll(page, [A, B], false);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("draft")).toHaveCount(0);
    await page.keyboard.press("Enter");
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("엣지: 점 1개에서 끝내면(같은 자리 다시 누름·Enter) 벽을 만들지 않는다", async ({
    page,
    isMobile,
  }) => {
    await pressAll(page, [A, A], isMobile);
    if (!isMobile) await page.keyboard.press("Enter");
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(page.getByTestId("draft")).toHaveCount(1); // 첫 점은 남아 있다
  });

  test("엣지: 점이 2개일 때 첫 점을 누르면 닫지 않는다", async ({ page, isMobile }) => {
    await pressAll(page, [A, B, A], isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
    await pressAll(page, [C, C], isMobile); // 이어서 그리다 끝내면 점 3개짜리 열린 벽
    expectNear((await wallPoints(page))[0], [A, B, C]);
  });

  test("스크린샷을 남긴다", async ({ page, isMobile }, testInfo) => {
    await pressAll(
      page,
      [
        { x: 50, y: 50 },
        { x: 550, y: 50 },
        { x: 550, y: 400 },
        { x: 50, y: 400 },
        { x: 50, y: 50 },
      ],
      isMobile,
    );
    await pressAll(
      page,
      [
        { x: 300, y: 50 },
        { x: 300, y: 250 },
        { x: 200, y: 250 },
        { x: 200, y: 250 },
      ],
      isMobile,
    );
    await page.screenshot({ path: testInfo.outputPath("polyline-tool.png"), fullPage: true });
  });
});
