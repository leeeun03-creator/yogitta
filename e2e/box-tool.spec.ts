import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  collectErrors,
  createSpace,
  dragFloorCm,
  dragScreen,
  floorBox,
  plan,
  pressCm,
  touchSender,
} from "./helpers";
import { FLOOR, placeBox } from "./boxes";

type Cm = { x: number; y: number };

const dragCm = (page: Page, from: Cm, to: Cm, isMobile: boolean, beforeUp?: () => Promise<void>) =>
  dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);
const draft = (page: Page) => plan(page).getByTestId("box-draft");

/** 놓인 가구들의 [가운데 x, 가운데 y, 가로, 깊이, 회전] (cm·도). */
async function boxData(page: Page) {
  const boxes = await plan(page).getByTestId("box").all();
  return Promise.all(
    boxes.map(async (box) => ((await box.getAttribute("data-box")) ?? "").split(",").map(Number)),
  );
}

/** 가구 하나가 기대한 값과 1cm 안으로 같은지 본다 (화면 px → cm 반올림 오차). */
function expectBox(actual: number[] | undefined, expected: number[]) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((value, index) =>
    expect(Math.abs((actual?.[index] ?? NaN) - value)).toBeLessThanOrEqual(1),
  );
}

test.describe("가구 도구", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "가구");
  });

  test("끌어서 놓으면 그 크기의 '보관함 1', 하나 더 놓으면 '보관함 2'", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await dragCm(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await placeBox(page, { x: 350, y: 250 }, { x: 550, y: 400 }, isMobile);
    const boxes = await boxData(page);
    expectBox(boxes[0], [200, 125, 200, 150, 0]);
    expectBox(boxes[1], [450, 325, 200, 150, 0]);
    await expect(plan(page).getByText("보관함 1", { exact: true })).toBeVisible();
    await expect(plan(page).getByText("보관함 2", { exact: true })).toBeVisible();
    await expect(plan(page)).toHaveAccessibleName(/가구 2개$/);
    // 보관함은 점선 테두리(고르지 않은 첫 가구), 정면(처음엔 아래쪽) 가장자리 밖에 삼각형
    await expect(plan(page).getByTestId("box").first().locator("rect")).toHaveAttribute(
      "stroke-dasharray",
      /.+/,
    );
    await expect(plan(page).getByTestId("box-front")).toHaveCount(2);
    expect(errors).toEqual([]);
  });

  test("끄는 동안 미리보기와 크기('200 × 150 cm')가 보이고, 놓으면 사라진다", async ({
    page,
    isMobile,
  }) => {
    await dragCm(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile, async () => {
      await expect(draft(page)).toBeVisible();
      await expect(plan(page).getByTestId("length-label")).toHaveText("200 × 150 cm");
    });
    await expect(draft(page)).toHaveCount(0);
    await expect(plan(page).getByTestId("length-label")).toHaveCount(0);
  });

  test("누르기만 하면 그 자리에 60 × 50 cm 보관함 (가장자리는 격자선에)", async ({
    page,
    isMobile,
  }) => {
    await pressCm(page, FLOOR, [{ x: 300, y: 200 }], isMobile);
    expectBox((await boxData(page))[0], [300, 205, 60, 50, 0]);
  });

  test("되돌리기로 놓은 가구가 사라지고 다시하기로 돌아온다", async ({ page, isMobile }) => {
    await dragCm(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
    await page.getByRole("button", { name: "다시하기" }).click();
    await expect(plan(page)).toHaveAccessibleName(/가구 1개$/);
    await expect(plan(page).getByText("보관함 1", { exact: true })).toBeVisible();
  });

  test("엣지: 바닥 밖으로 끌면 바닥 경계까지", async ({ page, isMobile }) => {
    const floor = await floorBox(page);
    const start = await cmToScreen(page, FLOOR, { x: 500, y: 350 });
    const outside = { x: floor.x + floor.width + 30, y: floor.y + floor.height + 30 };
    await dragScreen(page, start, outside, isMobile);
    expectBox((await boxData(page))[0], [550, 400, 100, 100, 0]);
  });

  test("엣지: 바닥 밖을 누르거나 바닥 밖에서 끌기 시작하면 놓지 않는다", async ({
    page,
    isMobile,
  }) => {
    const floor = await floorBox(page);
    const outside = { x: floor.x - 20, y: floor.y + 40 };
    if (isMobile) await page.touchscreen.tap(outside.x, outside.y);
    else await page.mouse.click(outside.x, outside.y);
    await dragScreen(page, outside, await cmToScreen(page, FLOOR, { x: 200, y: 200 }), isMobile);
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
  });

  test("엣지: 한 방향으로만 끌면 다른 방향은 누른 점에서 10cm", async ({ page, isMobile }) => {
    await dragCm(page, { x: 100, y: 100 }, { x: 300, y: 100 }, isMobile);
    expectBox((await boxData(page))[0], [200, 105, 200, 10, 0]);
  });

  test("엣지: 격자 스냅을 끄면 1cm 단위로 놓는다", async ({ page, isMobile }) => {
    await page.getByRole("switch", { name: "격자 스냅" }).click();
    await dragCm(page, { x: 103, y: 57 }, { x: 207, y: 141 }, isMobile);
    expectBox((await boxData(page))[0], [155, 99, 104, 84, 0]);
  });

  test("엣지: 끄는 중에 Esc를 누르면 취소된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await dragCm(page, { x: 100, y: 50 }, { x: 300, y: 200 }, false, async () => {
      await page.keyboard.press("Escape");
    });
    await expect(draft(page)).toHaveCount(0);
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
  });

  test("엣지: 끄는 중에 두 번째 손가락이 닿으면 취소된다 (핀치 줌)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "터치는 모바일에서만");
    const a = await cmToScreen(page, FLOOR, { x: 200, y: 150 });
    const b = await cmToScreen(page, FLOOR, { x: 400, y: 300 });
    const send = await touchSender(page);
    await send("touchStart", [a]);
    await send("touchMove", [{ x: a.x + 30, y: a.y + 20 }]);
    await send("touchStart", [{ x: a.x + 30, y: a.y + 20 }, b]);
    await send("touchMove", [a, { x: b.x + 40, y: b.y }]);
    await send("touchEnd", []);
    await expect(draft(page)).toHaveCount(0);
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
  });

  test("엣지: 터치로 끄는 동안 돋보기가 뜬다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "터치는 모바일에서만");
    await dragCm(page, { x: 100, y: 50 }, { x: 300, y: 200 }, true, async () => {
      await expect(page.getByTestId("loupe")).toBeVisible();
      await expect(page.getByTestId("loupe").getByTestId("box-draft")).toHaveCount(1);
    });
    await expect(page.getByTestId("loupe")).toHaveCount(0);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await dragCm(page, { x: 20, y: 14 }, { x: 140, y: 74 }, isMobile);
    await placeBox(page, { x: 150, y: 300 }, { x: 230, y: 360 }, isMobile);
    await chooseTool(page, "가구");
    await pressCm(page, FLOOR, [{ x: 470, y: 200 }], isMobile);
    await page.waitForTimeout(300); // 도구 막대 바탕색이 바뀌는 동안을 기다린다 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("box-tool.png"), fullPage: true });
  });
});
