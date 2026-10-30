import { expect, test, type Page } from "@playwright/test";
import { chooseTool, createSpace, pressCm, wallPoints } from "./helpers";

const FLOOR = { w: 600, h: 450 };

/** 직선 도구로 y줄에 가로 벽 하나를 그린다. */
async function drawLine(page: Page, y: number) {
  await pressCm(page, FLOOR, [{ x: 100, y }], false);
  await pressCm(page, FLOOR, [{ x: 500, y }], false);
}
const wallCount = async (page: Page) => (await wallPoints(page)).length;

test.describe("되돌리기·다시하기 키", () => {
  test.skip(({ isMobile }) => isMobile, "키보드는 데스크톱에서만 (휴대폰은 T13-3 버튼)");

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "직선");
  });

  test("Ctrl+Z로 그린 벽을 하나씩 되돌리고, Ctrl+Shift+Z·Ctrl+Y로 다시 생긴다", async ({
    page,
  }) => {
    await drawLine(page, 100);
    await drawLine(page, 200);
    expect(await wallCount(page)).toBe(2);
    await page.keyboard.press("Control+z");
    expect(await wallPoints(page)).toEqual([
      [
        [100, 100],
        [500, 100],
      ],
    ]);
    await page.keyboard.press("Control+z");
    expect(await wallCount(page)).toBe(0);
    await page.keyboard.press("Control+Shift+z");
    expect(await wallCount(page)).toBe(1);
    await page.keyboard.press("Control+y");
    expect(await wallCount(page)).toBe(2);
    await expect(page.getByRole("img", { name: /벽 2개, 구역 선 0개, 가구 0개$/ })).toBeVisible();
  });

  test("지운 선분을 되돌리면 벽이 원래대로 돌아온다", async ({ page }) => {
    await drawLine(page, 200);
    const before = await wallPoints(page);
    await chooseTool(page, "지우개");
    await pressCm(page, FLOOR, [{ x: 300, y: 200 }], false);
    expect(await wallCount(page)).toBe(0);
    await page.keyboard.press("Control+z");
    expect(await wallPoints(page)).toEqual(before);
  });

  test("Mac의 Cmd+Z도 되돌리기다", async ({ page }) => {
    await drawLine(page, 100);
    await page.keyboard.press("Meta+z");
    expect(await wallCount(page)).toBe(0);
  });

  test("엣지: 한글 입력 상태(글자 'ㅋ')에서도 Ctrl+Z가 된다", async ({ page }) => {
    await drawLine(page, 100);
    await page.evaluate(() => {
      const target = document.activeElement ?? document.body;
      target.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ㅋ", code: "KeyZ", ctrlKey: true, bubbles: true }),
      );
    });
    expect(await wallCount(page)).toBe(0);
  });

  test("엣지: 처음에서 되돌리기·끝에서 다시하기는 아무 일 없다", async ({ page }) => {
    await page.keyboard.press("Control+z");
    await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
    await drawLine(page, 100);
    await page.keyboard.press("Control+y");
    expect(await wallCount(page)).toBe(1);
  });

  test("엣지: 되돌린 뒤 새로 그리면 다시하기가 되지 않는다", async ({ page }) => {
    await drawLine(page, 100);
    await page.keyboard.press("Control+z");
    await drawLine(page, 300);
    await page.keyboard.press("Control+y");
    expect(await wallPoints(page)).toEqual([
      [
        [100, 300],
        [500, 300],
      ],
    ]);
  });

  test("엣지: 그리던 점은 되돌리기와 상관없이 그대로 남는다", async ({ page }) => {
    await drawLine(page, 100);
    await pressCm(page, FLOOR, [{ x: 100, y: 300 }], false);
    await page.keyboard.press("Control+z");
    expect(await wallCount(page)).toBe(0);
    await pressCm(page, FLOOR, [{ x: 500, y: 300 }], false);
    expect(await wallPoints(page)).toEqual([
      [
        [100, 300],
        [500, 300],
      ],
    ]);
  });

  test("엣지: 입력칸에 글자를 쓰는 중에는 Ctrl+Z를 가로채지 않는다", async ({ page }) => {
    await drawLine(page, 100);
    // 편집 모드에는 아직 입력칸이 없어서(속성 패널은 T6) 테스트용 입력칸을 붙인다
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.setAttribute("aria-label", "테스트 입력칸");
      document.body.append(input);
    });
    const input = page.getByLabel("테스트 입력칸");
    await input.fill("서랍");
    await input.press("Control+z");
    expect(await wallCount(page)).toBe(1);
  });

  test("엣지: 벽 51개를 그려도 되돌리기는 50번까지만 된다", async ({ page }) => {
    test.setTimeout(120_000);
    for (let i = 0; i < 51; i++) {
      await pressCm(page, FLOOR, [{ x: 20 + i * 10, y: 50 }], false);
      await pressCm(page, FLOOR, [{ x: 20 + i * 10, y: 400 }], false);
    }
    expect(await wallCount(page)).toBe(51);
    for (let i = 0; i < 55; i++) await page.keyboard.press("Control+z");
    expect(await wallCount(page)).toBe(1);
    for (let i = 0; i < 55; i++) await page.keyboard.press("Control+y");
    expect(await wallCount(page)).toBe(51);
  });
});
