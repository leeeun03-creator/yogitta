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
} from "./helpers";
import { FLOOR, boxButton, expectBox, placeBox } from "./boxes";

type Cm = { x: number; y: number };

const dragCm = (page: Page, from: Cm, to: Cm, isMobile: boolean) =>
  dragFloorCm(page, FLOOR, from, to, isMobile);
const label = (page: Page) => page.getByTestId("selected-box-label");
const tool = (page: Page, name: string) =>
  page.getByRole("toolbar", { name: "그리기 도구" }).getByRole("button", { name, exact: true });

test.describe("선택 도구로 가구 고르기·옮기기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 가운데 (200, 125)
  });

  test("가구를 놓으면 그 가구가 골라지고(강조 + 이름 알약) 선택 도구로 바뀐다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await expect(tool(page, "선택")).toHaveAttribute("aria-pressed", "true");
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "true");
    await expect(label(page)).toHaveText("보관함 1");
    // 고른 가구는 강조색 실선 테두리 (점선이 아니다)
    const body = plan(page).getByTestId("box").locator("rect");
    await expect(body).toHaveCSS("stroke", "rgb(168, 80, 27)");
    await expect(body).not.toHaveAttribute("stroke-dasharray", /.+/);
    expect(errors).toEqual([]);
  });

  test("빈 곳을 누르면 풀리고, 가구를 누르면 다시 골라진다", async ({ page, isMobile }) => {
    // 휴대폰은 고른 가구의 속성 패널이 화면 아래(바닥 y 400cm 언저리까지)를 가려서 그 위의 빈 곳을 누른다
    await pressCm(page, FLOOR, [{ x: 500, y: 300 }], isMobile);
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "false");
    await expect(label(page)).toHaveCount(0);
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], isMobile);
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "true");
    await expect(label(page)).toBeVisible();
  });

  test("가구를 누르면 그 아래 구획에 구역 입력칸이 뜨지 않는다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], isMobile);
    await expect(page.getByRole("textbox", { name: "구역 이름" })).toHaveCount(0);
  });

  test("가구를 끌면 옮겨지고(화면은 그대로), 되돌리기 한 번에 제자리다", async ({
    page,
    isMobile,
  }) => {
    const before = await floorBox(page);
    await dragCm(page, { x: 200, y: 125 }, { x: 300, y: 225 }, isMobile);
    await expectBox(page, [300, 225, 200, 150, 0]);
    expect(await floorBox(page)).toEqual(before);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expectBox(page, [200, 125, 200, 150, 0]);
    // 되돌리기 한 번 더 하면 놓기 전(가구 없음)이다
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
  });

  test("빈 곳을 끌면 지금처럼 2D 평면도가 움직이고 가구는 그대로다", async ({ page, isMobile }) => {
    const before = await floorBox(page);
    await dragCm(page, { x: 450, y: 350 }, { x: 350, y: 300 }, isMobile);
    expect((await floorBox(page)).x).toBeLessThan(before.x);
    await expectBox(page, [200, 125, 200, 150, 0]);
  });

  test("엣지: 바닥 경계 너머로 끌면 가장자리가 경계에 닿는 자리에서 멈춘다", async ({
    page,
    isMobile,
  }) => {
    const floor = await floorBox(page);
    const start = await cmToScreen(page, FLOOR, { x: 200, y: 125 });
    const outside = { x: floor.x + floor.width + 30, y: floor.y + floor.height + 30 };
    await dragScreen(page, start, outside, isMobile);
    await expectBox(page, [500, 375, 200, 150, 0]);
  });

  test("엣지: 격자 스냅이 켜져 있으면 가장자리가 10cm 격자선에 온다", async ({
    page,
    isMobile,
  }) => {
    await dragCm(page, { x: 200, y: 125 }, { x: 233, y: 142 }, isMobile);
    await expectBox(page, [230, 145, 200, 150, 0]);
  });

  test("엣지: 조금만(5px 안) 움직이고 떼면 누르기로 보고 옮기지 않는다", async ({
    page,
    isMobile,
  }) => {
    await pressCm(page, FLOOR, [{ x: 500, y: 400 }], isMobile); // 먼저 풀어 둔다
    const start = await cmToScreen(page, FLOOR, { x: 200, y: 125 });
    await dragScreen(page, start, { x: start.x + 3, y: start.y + 2 }, isMobile);
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "true");
    await expectBox(page, [200, 125, 200, 150, 0]);
  });

  test("엣지: 맞닿은 두 가구도 누른 쪽이 골라지고, 그 가구만 옮겨진다", async ({
    page,
    isMobile,
  }) => {
    // 가구끼리는 겹치게 놓을 수 없어(T6-8) 맞닿게 놓는다 (보관함 1 오른쪽 면 300)
    await placeBox(page, { x: 300, y: 50 }, { x: 450, y: 200 }, isMobile); // 보관함 2
    await pressCm(page, FLOOR, [{ x: 500, y: 400 }], isMobile);
    await pressCm(page, FLOOR, [{ x: 320, y: 125 }], isMobile);
    await expect(boxButton(page, "보관함 2")).toHaveAttribute("aria-pressed", "true");
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "false");
    await dragCm(page, { x: 400, y: 125 }, { x: 450, y: 225 }, isMobile);
    await expectBox(page, [200, 125, 200, 150, 0], 0);
    await expectBox(page, [425, 225, 150, 150, 0], 1);
  });

  test("엣지: 다른 도구를 고르면 고른 가구가 풀린다", async ({ page }) => {
    await chooseTool(page, "직선");
    await expect(label(page)).toHaveCount(0);
    await chooseTool(page, "선택");
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "false");
  });

  test("엣지: 2D 평면도 위쪽 끝 가구는 이름 알약이 가구 아래에, 아래쪽 가구는 위에 뜬다", async ({
    page,
    isMobile,
  }) => {
    const box = async () =>
      (await boxButton(page, "보관함 1").boundingBox()) ?? { y: 0, height: 0 };
    const labelY = async () => (await label(page).boundingBox())?.y ?? NaN;
    await dragCm(page, { x: 200, y: 125 }, { x: 200, y: 50 }, isMobile); // 바닥 위쪽 끝 (y 0~150)
    // 데스크톱은 바닥 위 여백이 48px뿐이라 알약(30px + 간격 50px)이 들어갈 자리가 없어 아래에 뜬다.
    // 휴대폰은 2D 평면도가 세로로 길어 바닥 위에 여백이 넉넉해서 위쪽 끝 가구도 위에 뜬다
    if (isMobile) expect(await labelY()).toBeLessThan((await box()).y);
    else expect(await labelY()).toBeGreaterThan((await box()).y);
    await dragCm(page, { x: 200, y: 75 }, { x: 200, y: 400 }, isMobile); // 바닥 아래쪽 끝
    expect(await labelY()).toBeLessThan((await box()).y);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await placeBox(page, { x: 340, y: 190 }, { x: 390, y: 240 }, isMobile);
    await page.waitForTimeout(300); // 도구 막대 바탕색이 바뀌는 동안을 기다린다 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("box-select.png"), fullPage: true });
  });
});
