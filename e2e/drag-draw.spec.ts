import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  createSpace,
  dragFloorCm,
  dragPath,
  dragScreen,
  floorBox,
  pressCm,
  wallPoints,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const drag = (page: Page, from: Cm, to: Cm, isMobile: boolean, beforeUp?: () => Promise<void>) =>
  dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);

test.describe("끌어서 그리기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("직선: 누른 채 끌고 떼면 누른 점 → 뗀 점 벽이 생긴다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile);
    expect(await wallPoints(page)).toEqual([
      [
        [100, 100],
        [400, 100],
      ],
    ]);
    await expect(page.getByTestId("draft")).toHaveCount(0);
  });

  test("직선: 끄는 동안 누른 점부터 미리보기 선이 보인다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 300 }, isMobile, async () => {
      await expect(page.getByTestId("draft")).toHaveAttribute("points", "100,100 400,300");
    });
  });

  test("직선: 두 점 모두 격자에 붙는다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drag(page, { x: 101, y: 52 }, { x: 398, y: 297 }, isMobile);
    expect((await wallPoints(page))[0]).toEqual([
      [100, 50],
      [400, 300],
    ]);
  });

  test("직선: 첫 점을 누른 뒤 끌면 첫 점 → 뗀 점 벽이 된다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await pressCm(page, FLOOR, [{ x: 100, y: 100 }], isMobile);
    await drag(page, { x: 300, y: 300 }, { x: 500, y: 100 }, isMobile);
    expect(await wallPoints(page)).toEqual([
      [
        [100, 100],
        [500, 100],
      ],
    ]);
  });

  test("연속선: 끌어서 시작하고 이어서 끌고, 마지막 점을 누르면 끝난다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "연속선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile);
    await drag(page, { x: 400, y: 100 }, { x: 400, y: 300 }, isMobile);
    expect(await wallPoints(page)).toHaveLength(0); // 아직 그리는 중
    await pressCm(page, FLOOR, [{ x: 400, y: 300 }], isMobile);
    expect(await wallPoints(page)).toEqual([
      [
        [100, 100],
        [400, 100],
        [400, 300],
      ],
    ]);
  });

  test("연속선: 끌어서 첫 점에 놓으면 닫힌 벽이 된다", async ({ page, isMobile }) => {
    await chooseTool(page, "연속선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile);
    await drag(page, { x: 400, y: 100 }, { x: 400, y: 300 }, isMobile);
    await drag(page, { x: 400, y: 300 }, { x: 100, y: 100 }, isMobile);
    await expect(page.getByTestId("wall").locator("polygon")).toHaveCount(1);
    expect(await wallPoints(page)).toHaveLength(1);
  });

  test("엣지: 5px 안으로만 움직이면 누르기로 본다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    const start = await cmToScreen(page, FLOOR, { x: 100, y: 100 });
    await dragScreen(page, start, { x: start.x + 4, y: start.y }, isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
    await pressCm(page, FLOOR, [{ x: 400, y: 100 }], isMobile);
    const [wall] = await wallPoints(page);
    // 누르기는 뗀 자리에 찍힌다. 360px 화면에서는 4px이 10cm 격자 한 칸쯤이라 110cm에 붙을 수 있다
    expect(wall?.[0]?.[0]).toBeGreaterThanOrEqual(100);
    expect(wall?.[0]?.[0]).toBeLessThanOrEqual(110);
    expect(wall?.slice(1)).toEqual([[400, 100]]);
  });

  test("엣지: 끌었다가 누른 자리로 돌아와 떼면 벽도 점도 남지 않는다", async ({
    page,
    isMobile,
  }) => {
    for (const tool of ["직선", "연속선"]) {
      await chooseTool(page, tool);
      const a = await cmToScreen(page, FLOOR, { x: 200, y: 200 });
      const b = await cmToScreen(page, FLOOR, { x: 400, y: 300 });
      await dragPath(page, [a, b, a], isMobile);
      expect(await wallPoints(page)).toHaveLength(0);
      await expect(page.getByTestId("draft")).toHaveCount(0);
      // 다음 누르기가 첫 점이 되어야 한다 (남은 점이 없다)
      await pressCm(page, FLOOR, [{ x: 500, y: 100 }], isMobile);
      expect(await wallPoints(page)).toHaveLength(0);
      await page.keyboard.press("Escape");
    }
  });

  test("엣지: 끄는 중에 Esc를 누르면 취소된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await chooseTool(page, "직선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 300 }, false, async () => {
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("draft")).toHaveCount(0);
    });
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("엣지: 바닥 밖으로 끌면 바닥 경계까지", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    const floor = await floorBox(page);
    const start = await cmToScreen(page, FLOOR, { x: 300, y: 200 });
    const outside = { x: floor.x + floor.width + 30, y: floor.y + floor.height + 30 };
    await dragScreen(page, start, outside, isMobile);
    expect((await wallPoints(page))[0]).toEqual([
      [300, 200],
      [600, 450],
    ]);
  });

  test("엣지: 끄는 중에 두 번째 손가락이 닿으면 그리지 않고 줌한다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "두 손가락은 모바일에서만");
    await chooseTool(page, "직선");
    const before = await floorBox(page);
    const a = await cmToScreen(page, FLOOR, { x: 200, y: 200 });
    const b = await cmToScreen(page, FLOOR, { x: 400, y: 200 });
    const cdp = await page.context().newCDPSession(page);
    const send = (type: "touchStart" | "touchMove" | "touchEnd", points: Cm[]) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: points.map((p, id) => ({ ...p, id })),
      });
    await send("touchStart", [a]);
    await send("touchMove", [{ x: a.x + 20, y: a.y }]);
    await send("touchStart", [{ x: a.x + 20, y: a.y }, b]);
    await send("touchMove", [
      { x: a.x - 20, y: a.y },
      { x: b.x + 40, y: b.y },
    ]);
    await send("touchEnd", []);
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(page.getByTestId("draft")).toHaveCount(0);
    expect((await floorBox(page)).width).toBeGreaterThan(before.width);
  });

  test("스크린샷을 남긴다", async ({ page, isMobile }, testInfo) => {
    await chooseTool(page, "연속선");
    await drag(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile);
    await drag(page, { x: 400, y: 100 }, { x: 400, y: 300 }, isMobile, async () => {
      await page.screenshot({ path: testInfo.outputPath("drag-draw.png"), fullPage: true });
    });
  });
});
