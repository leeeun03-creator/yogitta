import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  collectErrors,
  createSpace,
  dragFloorCm,
  plan,
  pressCm,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const panel = (page: Page) => page.getByRole("complementary", { name: "속성 패널" });
const boxButton = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

/** 직선 도구로 벽 하나를 긋는다 (두 점을 차례로 누른다). */
async function drawWall(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "직선");
  await pressCm(page, FLOOR, [from, to], isMobile);
  await chooseTool(page, "선택");
}

/** 가구 도구로 끌어 놓는다 (놓으면 그 가구가 골라지고 선택 도구가 된다). */
async function placeBox(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "가구");
  await dragFloorCm(page, FLOOR, from, to, isMobile);
}

/** index번째 가구의 [가운데 x, 가운데 y]가 1cm 안으로 같아질 때까지 기다린다. */
async function expectCenter(page: Page, expected: Cm, index = 0) {
  const center = async () => {
    const value = await plan(page).getByTestId("box").nth(index).getAttribute("data-box");
    const [x, y] = (value ?? "").split(",").map(Number);
    return Math.abs((x ?? NaN) - expected.x) < 1.5 && Math.abs((y ?? NaN) - expected.y) < 1.5;
  };
  await expect.poll(center, { message: `가구 가운데 ${expected.x}, ${expected.y}` }).toBe(true);
}

/** 이동 이벤트 한 번으로 크게 끈다 (지나는 자리 없이 벽 너머로 바로). */
async function jumpCm(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  const a = await cmToScreen(page, FLOOR, from);
  const b = await cmToScreen(page, FLOOR, to);
  if (isMobile) {
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", points: Cm[]) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    await touch("touchStart", [a]);
    await touch("touchMove", [b]);
    await touch("touchEnd", []);
    return;
  }
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 1 });
  await page.mouse.up();
}

test.describe("가구가 벽·다른 가구를 뚫지 않기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await drawWall(page, { x: 300, y: 0 }, { x: 300, y: 450 }, isMobile); // 벽 면: x 294 · 306
    await placeBox(page, { x: 100, y: 100 }, { x: 200, y: 200 }, isMobile); // 가운데 (150, 150)
  });

  test("벽 쪽으로 끌면 벽 면에 딱 붙어 멈춘다", async ({ page, isMobile }) => {
    const errors = collectErrors(page);
    await dragFloorCm(page, FLOOR, { x: 150, y: 150 }, { x: 450, y: 150 }, isMobile);
    await expectCenter(page, { x: 244, y: 150 }); // 오른쪽 면 294
    expect(errors).toEqual([]);
  });

  test("엣지: 비스듬히 끌면 벽을 따라 미끄러진다", async ({ page, isMobile }) => {
    await dragFloorCm(page, FLOOR, { x: 150, y: 150 }, { x: 450, y: 330 }, isMobile);
    await expectCenter(page, { x: 244, y: 330 });
  });

  test("엣지: 한 번에 크게 끌어도 벽을 건너뛰지 않는다", async ({ page, isMobile }) => {
    await jumpCm(page, { x: 150, y: 150 }, { x: 450, y: 150 }, isMobile);
    await expectCenter(page, { x: 244, y: 150 });
  });

  test("엣지: 다른 가구에도 맞닿는 데까지만 간다 (맞닿기는 된다)", async ({ page, isMobile }) => {
    await placeBox(page, { x: 230, y: 100 }, { x: 280, y: 200 }, isMobile); // 왼쪽 면 230
    await dragFloorCm(page, FLOOR, { x: 150, y: 150 }, { x: 260, y: 150 }, isMobile);
    await expectCenter(page, { x: 180, y: 150 }, 0);
  });

  test("엣지: 방향키로도 벽을 뚫지 않는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await boxButton(page, "보관함 1").focus();
    for (let press = 0; press < 12; press++) await page.keyboard.press("ArrowRight");
    await expectCenter(page, { x: 244, y: 150 });
  });

  test("엣지: 돌리면 벽에 걸리는 가구는 [90° 회전]이 막히고 까닭이 나온다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 250, y: 100 }, { x: 290, y: 300 }, isMobile); // 40 × 200, 벽까지 4cm
    const rotate = panel(page).getByRole("button", { name: "90° 회전" });
    await expect(rotate).toBeDisabled();
    await expect(rotate).toHaveAccessibleDescription("벽이나 다른 가구에 걸려서 돌릴 수 없어요");
  });

  test("엣지: 나중에 그은 벽과 겹친 가구는 빼낼 수 있고, 빼낸 뒤에는 다시 막힌다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 400, y: 300 }, { x: 500, y: 400 }, isMobile); // 가운데 (450, 350)
    await drawWall(page, { x: 450, y: 250 }, { x: 450, y: 450 }, isMobile); // 가구 한가운데로
    await dragFloorCm(page, FLOOR, { x: 420, y: 350 }, { x: 500, y: 350 }, isMobile);
    await expectCenter(page, { x: 530, y: 350 }, 1); // 겹친 채로도 움직인다
    await dragFloorCm(page, FLOOR, { x: 530, y: 350 }, { x: 430, y: 350 }, isMobile);
    await expectCenter(page, { x: 506, y: 350 }, 1); // 벽 면 456에 붙어 멈춘다
  });
});
