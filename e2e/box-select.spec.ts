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

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const dragCm = (page: Page, from: Cm, to: Cm, isMobile: boolean) =>
  dragFloorCm(page, FLOOR, from, to, isMobile);
const boxButton = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const label = (page: Page) => page.getByTestId("selected-box-label");
const tool = (page: Page, name: string) =>
  page.getByRole("toolbar", { name: "그리기 도구" }).getByRole("button", { name, exact: true });

/** 가구 도구로 끌어 놓는다 (놓으면 그 가구가 골라지고 선택 도구가 된다). */
async function placeBox(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "가구");
  await dragCm(page, from, to, isMobile);
}

/** 놓인 가구의 [가운데 x, 가운데 y, 가로, 깊이, 회전] (cm·도). */
async function boxData(page: Page, index = 0) {
  const value = await plan(page).getByTestId("box").nth(index).getAttribute("data-box");
  return (value ?? "").split(",").map(Number);
}

/** 가구 하나가 기대한 값과 1cm 안으로 같은지 본다. */
async function expectBox(page: Page, expected: number[], index = 0) {
  const actual = await boxData(page, index);
  expected.forEach((value, i) => expect(Math.abs((actual[i] ?? NaN) - value)).toBeLessThan(1.5));
}

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
    await pressCm(page, FLOOR, [{ x: 500, y: 400 }], isMobile);
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

  test("엣지: 끄는 중에 두 번째 손가락이 닿으면 옮기지 않는다 (핀치 줌)", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "터치는 모바일에서만");
    const a = await cmToScreen(page, FLOOR, { x: 200, y: 125 });
    const b = await cmToScreen(page, FLOOR, { x: 450, y: 350 });
    const send = await touchSender(page);
    await send("touchStart", [a]);
    await send("touchMove", [{ x: a.x + 30, y: a.y + 20 }]);
    await send("touchStart", [{ x: a.x + 30, y: a.y + 20 }, b]);
    await send("touchMove", [a, { x: b.x + 40, y: b.y }]);
    await send("touchEnd", []);
    await expectBox(page, [200, 125, 200, 150, 0]);
  });

  test("엣지: 빈 곳을 누른 채 두 번째 손가락이 가구에 닿아도 가구는 옮기지 않는다 (핀치 줌)", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "터치는 모바일에서만");
    const a = await cmToScreen(page, FLOOR, { x: 450, y: 350 }); // 빈 곳
    const b = await cmToScreen(page, FLOOR, { x: 200, y: 125 }); // 가구
    // 손가락 번호를 정해 보낸다 (CDP touchEnd는 적은 손가락을 뗀다)
    const cdp = await page.context().newCDPSession(page);
    type Finger = { x: number; y: number; id: number };
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", touchPoints: Finger[]) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
    const movedB = { x: b.x - 60, y: b.y - 40, id: 1 };
    await touch("touchStart", [{ ...a, id: 0 }]);
    await touch("touchStart", [
      { ...a, id: 0 },
      { ...b, id: 1 },
    ]);
    await touch("touchMove", [{ x: a.x + 20, y: a.y + 20, id: 0 }, movedB]);
    // 가구 위 손가락(1번)을 먼저 뗀다. 어느 손가락이든 떼면 끌기가 끝나므로, 끌기가 시작됐다면 여기서 옮겨진다
    await touch("touchEnd", [movedB]);
    await touch("touchEnd", []);
    await expectBox(page, [200, 125, 200, 150, 0]);
  });

  test("엣지: 키보드만으로 Tab으로 가구, Enter로 고르기, 방향키로 10cm, Esc로 풀기", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    const before = await floorBox(page);
    await page.getByLabel(/^2D 평면도 보기/).focus();
    await page.keyboard.press("Escape");
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Tab");
    await expect(boxButton(page, "보관함 1")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await expectBox(page, [210, 135, 200, 150, 0]);
    expect(await floorBox(page)).toEqual(before); // 방향키로 화면이 같이 움직이지 않는다
    await page.keyboard.press("Escape");
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Control+z");
    await expectBox(page, [210, 125, 200, 150, 0]);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await placeBox(page, { x: 340, y: 190 }, { x: 390, y: 240 }, isMobile);
    await page.waitForTimeout(300); // 도구 막대 바탕색이 바뀌는 동안을 기다린다 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("box-select.png"), fullPage: true });
  });
});
