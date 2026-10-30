import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  collectErrors,
  createSpace,
  dragFloorCm,
  expectNear,
  floorBox,
  wallPoints,
} from "./helpers";
import { FLOOR, drawWall, placeBox } from "./boxes";

type Cm = { x: number; y: number };

const undo = (page: Page) => page.getByRole("button", { name: "되돌리기" }).click();
const notice = (page: Page) =>
  page.getByRole("region", { name: "2D 평면도 영역" }).getByRole("status");
const drag = (page: Page, from: Cm, to: Cm, isMobile: boolean, beforeUp?: () => Promise<void>) =>
  dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);

test.describe("선택 도구로 벽 점을 끌어 벽 모양 바꾸기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await drawWall(page, { x: 100, y: 100 }, { x: 400, y: 100 }, isMobile); // 선택 도구로 돌아온다
  });

  test("벽 끝점을 끌면 옮겨지고(2D 평면도는 그대로), 되돌리기 한 번에 돌아온다", async ({
    page,
    isMobile,
  }, testInfo) => {
    const errors = collectErrors(page);
    const before = await floorBox(page);
    await drag(page, { x: 400, y: 100 }, { x: 400, y: 300 }, isMobile, async () => {
      await page.screenshot({ path: testInfo.outputPath("wall-point.png"), fullPage: true });
    });
    expectNear((await wallPoints(page))[0], [
      { x: 100, y: 100 },
      { x: 400, y: 300 },
    ]);
    expect(await floorBox(page)).toEqual(before); // 벽 점을 끌면 화면이 같이 움직이지 않는다
    await undo(page);
    expectNear((await wallPoints(page))[0], [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
    ]);
    expect(errors).toEqual([]);
  });

  test("끝점끼리 붙은 벽은 같이 옮겨져 이어진 채로 남는다", async ({ page, isMobile }) => {
    await drawWall(page, { x: 400, y: 100 }, { x: 400, y: 300 }, isMobile); // 끝점에 붙여 긋는다
    await drag(page, { x: 400, y: 100 }, { x: 450, y: 150 }, isMobile);
    const walls = await wallPoints(page);
    expectNear(walls[0], [
      { x: 100, y: 100 },
      { x: 450, y: 150 },
    ]);
    expectNear(walls[1], [
      { x: 450, y: 150 },
      { x: 400, y: 300 },
    ]);
  });

  test("엣지: 사각형 벽 꼭짓점도 옮기고, 닫힌 벽은 그대로 닫혀 있다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "사각형");
    await drag(page, { x: 100, y: 200 }, { x: 300, y: 400 }, isMobile);
    await chooseTool(page, "선택");
    await drag(page, { x: 300, y: 400 }, { x: 350, y: 420 }, isMobile);
    const rect = (await wallPoints(page))[1];
    expect(rect).toHaveLength(4);
    expect(
      rect?.some(([x, y]) => Math.abs((x ?? 0) - 350) < 1 && Math.abs((y ?? 0) - 420) < 1),
    ).toBe(true);
  });

  test("엣지: 옆 점 위로 끌면(길이 0) 그대로이고, 바닥 밖으로 끌면 바닥 경계까지 간다", async ({
    page,
    isMobile,
  }) => {
    await drag(page, { x: 400, y: 100 }, { x: 100, y: 100 }, isMobile);
    expectNear((await wallPoints(page))[0], [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
    ]);
    await drag(page, { x: 400, y: 100 }, { x: 650, y: 100 }, isMobile);
    expectNear((await wallPoints(page))[0], [
      { x: 100, y: 100 },
      { x: 600, y: 100 },
    ]);
  });

  test("엣지: 옮긴 벽이 가구를 지나가게 되면 그대로이고 안내가 뜬다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 200, y: 200 }, { x: 300, y: 300 }, isMobile);
    await drag(page, { x: 400, y: 100 }, { x: 250, y: 350 }, isMobile); // (100, 100) → (250, 350)이 가구를 지난다
    await expect(notice(page)).toHaveText("가구와 겹치는 자리로는 벽을 옮길 수 없어요");
    expectNear((await wallPoints(page))[0], [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
    ]);
  });

  test("엣지: 끄는 중에 Esc를 누르면 옮기지 않는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    const from = await cmToScreen(page, FLOOR, { x: 400, y: 100 });
    const to = await cmToScreen(page, FLOOR, { x: 400, y: 300 });
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 5 });
    await page.keyboard.press("Escape");
    await page.mouse.up();
    expectNear((await wallPoints(page))[0], [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
    ]);
  });
});
