import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  createSpace,
  expectNear,
  floorBox,
  pressCm,
  wallPoints,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
const WALL_COLOR = "rgb(110, 82, 54)"; // #6E5236 (yogitta-design 6장)

const pressAt = (page: Page, cm: { x: number; y: number }, isMobile: boolean) =>
  pressCm(page, FLOOR, [cm], isMobile);

test.describe("직선 도구", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "직선");
  });

  test("두 번 누르면 점 2개짜리 벽 하나가 생긴다", async ({ page, isMobile }) => {
    await pressAt(page, { x: 100, y: 100 }, isMobile);
    await pressAt(page, { x: 400, y: 100 }, isMobile);
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expectNear(walls[0], [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
    ]);
    await expect(page.getByRole("img", { name: /벽 1개$/ })).toBeVisible();
    await expect(page.getByTestId("joint")).toHaveCount(2);
  });

  test("벽은 #6E5236 색, 두께 12cm다", async ({ page, isMobile }) => {
    await pressAt(page, { x: 100, y: 200 }, isMobile);
    await pressAt(page, { x: 500, y: 200 }, isMobile);
    const shape = page.getByTestId("wall").locator("polyline");
    await expect(shape).toHaveAttribute("stroke", "#6E5236");
    await expect(shape).toHaveAttribute("stroke-width", "12");
    await expect(shape).toHaveCSS("stroke", WALL_COLOR);
  });

  test("첫 점을 찍으면 커서를 따라가는 미리보기 선이 보인다", async ({ page, isMobile }) => {
    test.skip(isMobile, "커서(마우스 올림)는 데스크톱에서만");
    await pressAt(page, { x: 100, y: 100 }, false);
    const cursor = await cmToScreen(page, FLOOR, { x: 300, y: 300 });
    await page.mouse.move(cursor.x, cursor.y);
    const draft = page.getByTestId("draft");
    await expect(draft).toBeVisible();
    const points = ((await draft.getAttribute("points")) ?? "").split(" ");
    expect(points).toHaveLength(2);
  });

  test("엣지: 같은 자리를 두 번 누르면 벽을 만들지 않는다", async ({ page, isMobile }) => {
    await pressAt(page, { x: 200, y: 200 }, isMobile);
    await pressAt(page, { x: 200, y: 200 }, isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("엣지: Esc를 누르면 그리던 선이 취소된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await pressAt(page, { x: 100, y: 100 }, false);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("draft")).toHaveCount(0);
    await pressAt(page, { x: 300, y: 100 }, false);
    expect(await wallPoints(page)).toHaveLength(0); // 새로 시작한 첫 점일 뿐이다
  });

  test("엣지: 바닥 밖을 누르면 바닥 경계에 점이 붙는다", async ({ page, isMobile }) => {
    const floor = await floorBox(page);
    await pressAt(page, { x: 100, y: 100 }, isMobile);
    const outside = { x: floor.x - 20, y: floor.y + floor.height / 2 };
    if (isMobile) await page.touchscreen.tap(outside.x, outside.y);
    else await page.mouse.click(outside.x, outside.y);
    const walls = await wallPoints(page);
    expect(walls[0]?.[1]?.[0]).toBe(0);
  });

  test("엣지: 줌·이동한 뒤에도 누른 자리에 점이 찍힌다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휠은 데스크톱에서만");
    const center = await cmToScreen(page, FLOOR, { x: 300, y: 225 });
    await page.mouse.move(center.x, center.y);
    await page.mouse.wheel(0, -100);
    await page.mouse.wheel(0, -100);
    // 선택 도구로 끌어서 옮긴 뒤 다시 직선 도구로
    await chooseTool(page, "선택");
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x - 120, center.y - 60, { steps: 4 });
    await page.mouse.up();
    await chooseTool(page, "직선");
    await pressAt(page, { x: 250, y: 200 }, false);
    await pressAt(page, { x: 350, y: 260 }, false);
    expectNear((await wallPoints(page))[0], [
      { x: 250, y: 200 },
      { x: 350, y: 260 },
    ]);
  });

  test("엣지: 그리기 도구에서는 끌어도 화면이 움직이지 않고 점도 찍히지 않는다", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "마우스 끌기는 데스크톱에서만");
    const before = await floorBox(page);
    const start = await cmToScreen(page, FLOOR, { x: 200, y: 200 });
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 150, start.y + 80, { steps: 5 });
    await page.mouse.up();
    expect(await floorBox(page)).toEqual(before);
    await expect(page.getByTestId("draft")).toHaveCount(0);
  });

  test("엣지: 도구를 바꾸면 그리던 선이 취소된다", async ({ page, isMobile }) => {
    await pressAt(page, { x: 100, y: 100 }, isMobile);
    await chooseTool(page, "선택");
    await chooseTool(page, "직선");
    await pressAt(page, { x: 300, y: 100 }, isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await pressAt(page, { x: 0, y: 0 }, isMobile);
    await pressAt(page, { x: 600, y: 0 }, isMobile);
    await pressAt(page, { x: 330, y: 0 }, isMobile);
    await pressAt(page, { x: 330, y: 260 }, isMobile);
    await page.screenshot({ path: testInfo.outputPath("line-tool.png"), fullPage: true });
  });
});
