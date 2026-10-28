import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  createSpace,
  floorBox,
  pressCm,
  pressScreen,
  wallPoints,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

async function pxPerCm(page: Page) {
  return (await floorBox(page)).width / FLOOR.w;
}
/** 바닥 점(cm)에서 화면으로 offsetPx만큼 오른쪽으로 비킨 자리를 누른다. */
async function pressBeside(page: Page, cm: Cm, offsetPx: number, isMobile: boolean) {
  const at = await cmToScreen(page, FLOOR, cm);
  await pressScreen(page, { x: at.x + offsetPx, y: at.y }, isMobile);
}
async function drawLine(page: Page, a: Cm, b: Cm, isMobile: boolean) {
  await chooseTool(page, "직선");
  await pressCm(page, FLOOR, [a, b], isMobile);
}

test.describe("격자·끝점 스냅", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("기존 벽 끝점 근처(화면 6px)를 누르면 좌표가 완전히 같아진다 (틈 0)", async ({
    page,
    isMobile,
  }) => {
    // 끝점이 격자 위에 있으면 격자 스냅만으로도 맞아 보이므로, 격자 밖 끝점(605cm, 바닥 오른쪽 경계)으로 본다
    const wide = { w: 605, h: 450 };
    await createSpace(page, { width: "6.05", depth: "4.5" });
    await chooseTool(page, "직선");
    await pressCm(
      page,
      wide,
      [
        { x: 100, y: 100 },
        { x: 640, y: 100 },
      ],
      isMobile,
    ); // 바닥 밖 → 경계 605
    const end = await cmToScreen(page, wide, { x: 605, y: 100 });
    await pressScreen(page, { x: end.x - 6, y: end.y }, isMobile);
    await pressCm(page, wide, [{ x: 400, y: 300 }], isMobile);
    const walls = await wallPoints(page);
    expect(walls[0]?.[1]).toEqual([605, 100]);
    expect(walls[1]?.[0]).toEqual(walls[0]?.[1]); // 근사가 아니라 같은 값 (격자였다면 600)
  });

  test("붙을 벽 점이 없으면 10cm 격자에 붙는다 (123 → 120)", async ({ page, isMobile }) => {
    await drawLine(page, { x: 123, y: 207 }, { x: 348, y: 207 }, isMobile);
    expect((await wallPoints(page))[0]).toEqual([
      [120, 210],
      [350, 210],
    ]);
  });

  test("사각형 모서리도 격자에 붙는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "마우스 끌기는 데스크톱에서만 (모바일 끌기는 사각형 테스트에서)");
    await chooseTool(page, "사각형");
    const a = await cmToScreen(page, FLOOR, { x: 101, y: 52 });
    const b = await cmToScreen(page, FLOOR, { x: 398, y: 297 });
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 4 });
    await page.mouse.up();
    expect((await wallPoints(page))[0]).toEqual([
      [100, 50],
      [400, 50],
      [400, 300],
      [100, 300],
    ]);
  });

  test("엣지: 끝점에서 화면 16px(12px 밖)이면 끝점이 아니라 격자에 붙는다", async ({
    page,
    isMobile,
  }) => {
    await drawLine(page, { x: 100, y: 100 }, { x: 300, y: 100 }, isMobile);
    await pressBeside(page, { x: 300, y: 100 }, 16, isMobile);
    await pressCm(page, FLOOR, [{ x: 400, y: 300 }], isMobile);
    const start = (await wallPoints(page))[1]?.[0];
    const expectedX = Math.round((300 + 16 / (await pxPerCm(page))) / 10) * 10;
    expect(start).toEqual([expectedX, 100]);
    expect(start?.[0]).not.toBe(300);
  });

  test("엣지: 줌한 상태에서도 화면 12px 기준으로 붙는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휠은 데스크톱에서만");
    const wide = { w: 605, h: 450 };
    await createSpace(page, { width: "6.05", depth: "4.5" });
    await chooseTool(page, "직선");
    await pressCm(
      page,
      wide,
      [
        { x: 400, y: 200 },
        { x: 640, y: 200 },
      ],
      false,
    ); // 끝점 605 (격자 밖)
    const end = await cmToScreen(page, wide, { x: 605, y: 200 });
    await page.mouse.move(end.x - 40, end.y);
    for (let i = 0; i < 5; i++) await page.mouse.wheel(0, -100);
    const zoomed = await cmToScreen(page, wide, { x: 605, y: 200 });
    await pressScreen(page, { x: zoomed.x - 8, y: zoomed.y }, false); // 줌해서 8px ≈ 2.5cm
    await pressCm(page, wide, [{ x: 560, y: 260 }], false);
    expect((await wallPoints(page))[1]?.[0]).toEqual([605, 200]);
  });

  test("엣지: 연속선을 첫 점 근처에서 닫으면 정확히 그 점으로 닫힌다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "연속선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 100, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 300 },
      ],
      isMobile,
    );
    await pressBeside(page, { x: 100, y: 100 }, 5, isMobile);
    await expect(page.getByTestId("wall").locator("polygon")).toHaveCount(1);
    expect((await wallPoints(page))[0]).toEqual([
      [100, 100],
      [400, 100],
      [400, 300],
    ]);
  });

  test("커서가 벽 점 근처면 고리, 아니면 격자 점이 표시된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "커서(마우스 올림)는 데스크톱에서만");
    await drawLine(page, { x: 100, y: 100 }, { x: 300, y: 100 }, false);
    const near = await cmToScreen(page, FLOOR, { x: 300, y: 100 });
    await page.mouse.move(near.x + 5, near.y);
    await expect(page.getByTestId("snap-endpoint")).toHaveCount(1);
    await expect(page.getByTestId("snap-endpoint")).toHaveAttribute("cx", "300");
    const far = await cmToScreen(page, FLOOR, { x: 200, y: 300 });
    await page.mouse.move(far.x, far.y);
    await expect(page.getByTestId("snap-endpoint")).toHaveCount(0);
    await expect(page.getByTestId("snap-grid")).toHaveCount(1);
  });
});
