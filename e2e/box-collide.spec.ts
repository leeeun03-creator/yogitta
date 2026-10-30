import { expect, test, type Page } from "@playwright/test";
import { cmToScreen, collectErrors, createSpace, dragFloorCm } from "./helpers";
import { FLOOR, boxButton, drawWall, expectBox, panel, placeBox } from "./boxes";

type Cm = { x: number; y: number };

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
    await expectBox(page, [244, 150]); // 오른쪽 면 294
    expect(errors).toEqual([]);
  });

  test("엣지: 비스듬히 끌면 벽을 따라 미끄러진다", async ({ page, isMobile }) => {
    await dragFloorCm(page, FLOOR, { x: 150, y: 150 }, { x: 450, y: 330 }, isMobile);
    await expectBox(page, [244, 330]);
  });

  test("엣지: 한 번에 크게 끌어도 벽을 건너뛰지 않는다", async ({ page, isMobile }) => {
    await jumpCm(page, { x: 150, y: 150 }, { x: 450, y: 150 }, isMobile);
    await expectBox(page, [244, 150]);
  });

  test("엣지: 다른 가구에도 맞닿는 데까지만 간다 (맞닿기는 된다)", async ({ page, isMobile }) => {
    await placeBox(page, { x: 230, y: 100 }, { x: 280, y: 200 }, isMobile); // 왼쪽 면 230
    await dragFloorCm(page, FLOOR, { x: 150, y: 150 }, { x: 260, y: 150 }, isMobile);
    await expectBox(page, [180, 150], 0);
  });

  test("엣지: 방향키로도 벽을 뚫지 않는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await boxButton(page, "보관함 1").focus();
    for (let press = 0; press < 12; press++) await page.keyboard.press("ArrowRight");
    await expectBox(page, [244, 150]);
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
});
