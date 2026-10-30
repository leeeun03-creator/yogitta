import { expect, test } from "@playwright/test";
import { cmToScreen, createSpace, floorBox, touchSender } from "./helpers";
import { FLOOR, boxButton, expectBox, placeBox } from "./boxes";

test.describe("선택 도구로 가구 고르기·옮기기 (두 손가락·키보드)", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 터치는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 가운데 (200, 125)
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
});
