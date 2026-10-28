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
const WALL_HALF_CM = 6; // 벽 두께 12cm의 절반
type Cm = { x: number; y: number };

const pressAll = (page: Page, points: Cm[], isMobile: boolean) =>
  pressCm(page, FLOOR, points, isMobile);
/** 연속선으로 벽을 그린다. closed면 첫 점을 다시 눌러 닫고, 아니면 마지막 점을 다시 눌러 끝낸다. */
async function drawPolyline(page: Page, points: Cm[], closed: boolean, isMobile: boolean) {
  await chooseTool(page, "연속선");
  const last = closed ? points[0] : points.at(-1);
  await pressAll(page, [...points, ...(last ? [last] : [])], isMobile);
}
async function cmPerPx(page: Page) {
  return FLOOR.w / (await floorBox(page)).width;
}

test.describe("지우개 도구", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("닫힌 사각형의 한 변을 지우면 점 4개짜리 열린 벽이 된다", async ({ page, isMobile }) => {
    const [a, b, c, d] = [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 300 },
      { x: 100, y: 300 },
    ];
    await drawPolyline(page, [a, b, c, d], true, isMobile);
    await chooseTool(page, "지우개");
    await pressAll(page, [{ x: 250, y: 100 }], isMobile); // 위쪽 변 (a-b)
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expect(
      walls[0]?.map(([x, y]) => [Math.round((x ?? 0) / 10), Math.round((y ?? 0) / 10)]),
    ).toEqual([
      [40, 10],
      [40, 30],
      [10, 30],
      [10, 10],
    ]); // b → c → d → a (지운 자리가 양 끝)
    await expect(page.getByTestId("wall").locator("polygon")).toHaveCount(0);
  });

  test("열린 연속선 가운데 선분을 지우면 벽 2개로 나뉜다", async ({ page, isMobile }) => {
    await drawPolyline(
      page,
      [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 500, y: 300 },
      ],
      false,
      isMobile,
    );
    await chooseTool(page, "지우개");
    await pressAll(page, [{ x: 300, y: 200 }], isMobile);
    expect(await wallPoints(page)).toHaveLength(2);
  });

  test("선분 1개짜리 벽은 통째로 지워진다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await pressAll(
      page,
      [
        { x: 100, y: 200 },
        { x: 500, y: 200 },
      ],
      isMobile,
    );
    await chooseTool(page, "지우개");
    await pressAll(page, [{ x: 300, y: 200 }], isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("선분에 올리면 지울 선분이 표시되고, 벗어나면 사라진다", async ({ page, isMobile }) => {
    test.skip(isMobile, "올림(hover)은 데스크톱에서만");
    await chooseTool(page, "직선");
    await pressAll(
      page,
      [
        { x: 100, y: 200 },
        { x: 500, y: 200 },
      ],
      false,
    );
    await chooseTool(page, "지우개");
    const on = await cmToScreen(page, FLOOR, { x: 300, y: 200 });
    await page.mouse.move(on.x, on.y);
    // SVG 가로선은 높이 0 상자라 Playwright가 "보임"으로 치지 않아서 개수로 확인한다
    await expect(page.getByTestId("erasing")).toHaveCount(1);
    await expect(page.getByTestId("erasing")).toHaveCSS("stroke", "rgb(155, 44, 31)"); // --yg-danger
    const off = await cmToScreen(page, FLOOR, { x: 300, y: 350 });
    await page.mouse.move(off.x, off.y);
    await expect(page.getByTestId("erasing")).toHaveCount(0);
  });

  test("엣지: 빈 곳을 누르면 아무 일도 없다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await pressAll(
      page,
      [
        { x: 100, y: 200 },
        { x: 500, y: 200 },
      ],
      isMobile,
    );
    await chooseTool(page, "지우개");
    await pressAll(page, [{ x: 300, y: 350 }], isMobile);
    expect(await wallPoints(page)).toHaveLength(1);
  });

  test("엣지: 벽 가장자리에서 화면 8px 안이면 지워지고, 그보다 멀면 안 지워진다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "직선");
    await pressAll(
      page,
      [
        { x: 100, y: 200 },
        { x: 500, y: 200 },
      ],
      isMobile,
    );
    await chooseTool(page, "지우개");
    const center = await cmToScreen(page, FLOOR, { x: 300, y: 200 });
    const edgePx = WALL_HALF_CM / (await cmPerPx(page));
    await pressScreen(page, { x: center.x, y: center.y + edgePx + 13 }, isMobile); // 8px 밖
    expect(await wallPoints(page)).toHaveLength(1);
    await pressScreen(page, { x: center.x, y: center.y + edgePx + 5 }, isMobile); // 8px 안
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("엣지: 줌한 상태에서도 누른 그 선분만 지운다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휠은 데스크톱에서만");
    await chooseTool(page, "직선");
    await pressAll(
      page,
      [
        { x: 200, y: 200 },
        { x: 400, y: 200 },
      ],
      false,
    );
    await pressAll(
      page,
      [
        { x: 200, y: 230 },
        { x: 400, y: 230 },
      ],
      false,
    ); // 30cm 아래 나란한 벽
    const center = await cmToScreen(page, FLOOR, { x: 300, y: 215 });
    await page.mouse.move(center.x, center.y);
    for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -100);
    await chooseTool(page, "지우개");
    await pressAll(page, [{ x: 300, y: 230 }], false);
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expect(walls[0]?.[0]?.[1]).toBeCloseTo(200, -1);
  });
});
