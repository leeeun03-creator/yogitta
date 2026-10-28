import { expect, test, type Page } from "@playwright/test";
import { createSpace, plan } from "./helpers";

const ZOOM_STEP = 1.2; // shared/constants/floorPlan.ts
const ZOOM_MAX = 8;
const ZOOM_MIN = 0.5;
const KEYBOARD_PAN_PX = 40;

const FLOOR_STROKE_PX = 1; // 바닥 테두리는 줌과 상관없이 1px

/** 바닥 사각형 위치·크기(px). 테두리 선 두께는 빼서 바닥만 잰다. */
async function floorBox(page: Page) {
  const box = await plan(page).getByTestId("floor").boundingBox();
  if (!box) throw new Error("바닥이 보이지 않는다");
  const half = FLOOR_STROKE_PX / 2;
  return {
    x: box.x + half,
    y: box.y + half,
    width: box.width - FLOOR_STROKE_PX,
    height: box.height - FLOOR_STROKE_PX,
  };
}
function planArea(page: Page) {
  return page.getByRole("region", { name: "2D 평면도 영역" });
}
async function floorCenter(page: Page) {
  const box = await floorBox(page);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test.describe("2D 평면도 줌·이동 (마우스·키보드)", () => {
  test.skip(({ isMobile }) => isMobile, "휠·마우스·키보드는 데스크톱에서 검사한다");

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("휠을 올리면 커지고 커서 아래 지점은 그대로다", async ({ page }) => {
    const before = await floorBox(page);
    const cursor = { x: before.x + before.width * 0.25, y: before.y + before.height * 0.25 };
    await page.mouse.move(cursor.x, cursor.y);
    await page.mouse.wheel(0, -100);
    await expect
      .poll(async () => (await floorBox(page)).width)
      .toBeCloseTo(before.width * ZOOM_STEP, 0);

    const after = await floorBox(page);
    expect((cursor.x - after.x) / after.width).toBeCloseTo(0.25, 2);
    expect((cursor.y - after.y) / after.height).toBeCloseTo(0.25, 2);
  });

  test("엣지: 휠을 계속 굴려도 최대·최소에서 멈추고 페이지는 스크롤되지 않는다", async ({
    page,
  }) => {
    const start = await floorBox(page);
    const center = await floorCenter(page);
    await page.mouse.move(center.x, center.y);
    for (let i = 0; i < 40; i++) await page.mouse.wheel(0, -100);
    await expect
      .poll(async () => (await floorBox(page)).width)
      .toBeCloseTo(start.width * ZOOM_MAX, 0);
    for (let i = 0; i < 40; i++) await page.mouse.wheel(0, 100);
    await expect
      .poll(async () => (await floorBox(page)).width)
      .toBeCloseTo(start.width * ZOOM_MIN, 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("끌면 바닥이 같은 거리만큼 따라온다", async ({ page }) => {
    const before = await floorBox(page);
    const center = await floorCenter(page);
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x + 100, center.y + 50, { steps: 5 });
    await page.mouse.up();
    const after = await floorBox(page);
    expect(after.x - before.x).toBeCloseTo(100, 0);
    expect(after.y - before.y).toBeCloseTo(50, 0);
  });

  test("엣지: 아주 멀리 끌어도 바닥 일부는 영역 안에 남는다", async ({ page }) => {
    // 창 밖으로는 마우스 이벤트가 오지 않으므로, 화면 안에서 400px씩 10번(4000px) 끈다
    const area = await planArea(page).boundingBox();
    if (!area) throw new Error("영역이 없다");
    const start = { x: area.x + 50, y: area.y + 50 };
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(start.x + 400, start.y + 200, { steps: 4 });
      await page.mouse.up();
    }
    const floor = await floorBox(page);
    expect(floor.x).toBeLessThan(area.x + area.width);
    expect(floor.y).toBeLessThan(area.y + area.height);
    expect(floor.x + floor.width).toBeGreaterThan(area.x);
    expect(floor.y + floor.height).toBeGreaterThan(area.y);
  });

  test("키보드만으로: + 줌, 방향키 이동, 0 처음 보기", async ({ page }) => {
    const start = await floorBox(page);
    const plan = page.getByLabel(/^2D 평면도 보기/);
    await plan.focus();
    await expect(plan).toBeFocused();

    await page.keyboard.press("+");
    await expect
      .poll(async () => (await floorBox(page)).width)
      .toBeCloseTo(start.width * ZOOM_STEP, 0);

    const zoomed = await floorBox(page);
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => (await floorBox(page)).x)
      .toBeCloseTo(zoomed.x - KEYBOARD_PAN_PX, 0);

    await page.keyboard.press("0");
    await expect.poll(async () => (await floorBox(page)).width).toBeCloseTo(start.width, 0);
    expect((await floorBox(page)).x).toBeCloseTo(start.x, 0);
  });
});

test.describe("2D 평면도 줌·이동 (터치)", () => {
  test.skip(
    ({ isMobile, browserName }) => !isMobile || browserName !== "chromium",
    "모바일 크롬에서 검사한다",
  );

  test("두 손가락을 벌리면 커진다", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    const before = await floorBox(page);
    const center = await floorCenter(page);
    const cdp = await page.context().newCDPSession(page);
    const touch = (spread: number) => [
      { x: center.x - spread, y: center.y, id: 1 },
      { x: center.x + spread, y: center.y, id: 2 },
    ];

    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touch(20) });
    for (let spread = 25; spread <= 60; spread += 5) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touch(spread) });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

    // 손가락 사이가 20 → 60px(3배)로 벌어졌다
    await expect.poll(async () => (await floorBox(page)).width).toBeCloseTo(before.width * 3, 0);
  });
});
