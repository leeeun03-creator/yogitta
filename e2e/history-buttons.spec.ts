import { expect, test, type Page } from "@playwright/test";
import { chooseTool, createSpace, pressCm, wallPoints } from "./helpers";

const FLOOR = { w: 600, h: 450 };
const ICON_ON = "rgb(59, 47, 37)"; // --yg-text
const ICON_OFF = "rgb(184, 163, 140)"; // --yg-disabled-icon #B8A38C

const undoButton = (page: Page) => page.getByRole("button", { name: "되돌리기" });
const redoButton = (page: Page) => page.getByRole("button", { name: "다시하기" });

async function drawLine(page: Page, y: number, isMobile: boolean) {
  await pressCm(page, FLOOR, [{ x: 100, y }], isMobile);
  await pressCm(page, FLOOR, [{ x: 500, y }], isMobile);
}

test.describe("되돌리기·다시하기 버튼", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("상단 바에 두 버튼이 있고, 처음에는 둘 다 막혀 있다", async ({ page }) => {
    const group = page.getByRole("banner").getByRole("group", { name: "되돌리기·다시하기" });
    await expect(group.getByRole("button")).toHaveCount(2);
    await expect(undoButton(page)).toBeDisabled();
    await expect(redoButton(page)).toBeDisabled();
    await expect(undoButton(page)).toHaveCSS("color", ICON_OFF);
  });

  test("누르면 되돌리고 다시 생기며, 끝에서는 막힌다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drawLine(page, 100, isMobile);
    await drawLine(page, 200, isMobile);
    await expect(undoButton(page)).toBeEnabled();
    await expect(undoButton(page)).toHaveCSS("color", ICON_ON);
    await expect(redoButton(page)).toBeDisabled();

    await undoButton(page).click();
    expect(await wallPoints(page)).toHaveLength(1);
    await expect(redoButton(page)).toBeEnabled();
    await undoButton(page).click();
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(undoButton(page)).toBeDisabled();

    await redoButton(page).click();
    await redoButton(page).click();
    expect(await wallPoints(page)).toHaveLength(2);
    await expect(redoButton(page)).toBeDisabled();
  });

  test("버튼을 눌러도 고른 그리기 도구와 그리던 점은 그대로다", async ({ page, isMobile }) => {
    await chooseTool(page, "직선");
    await drawLine(page, 100, isMobile);
    await pressCm(page, FLOOR, [{ x: 100, y: 300 }], isMobile);
    await undoButton(page).click();
    await expect(page.getByRole("button", { name: "직선", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await pressCm(page, FLOOR, [{ x: 500, y: 300 }], isMobile);
    expect(await wallPoints(page)).toEqual([
      [
        [100, 300],
        [500, 300],
      ],
    ]);
  });

  test("키보드 Tab으로 가서 Enter로 누를 수 있다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await chooseTool(page, "직선");
    await drawLine(page, 100, false);
    await undoButton(page).focus();
    await expect(undoButton(page)).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await wallPoints(page)).toHaveLength(0);
    await page.keyboard.press("Tab");
    await expect(redoButton(page)).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await wallPoints(page)).toHaveLength(1);
  });

  test("엣지: 버튼은 44×44이고, 360px에서도 상단 바가 넘치지 않는다", async ({ page }) => {
    for (const button of [undoButton(page), redoButton(page)]) {
      const box = await button.boundingBox();
      expect(box?.width).toBe(44);
      expect(box?.height).toBe(44);
    }
    const banner = await page.getByRole("banner").boundingBox();
    const redo = await redoButton(page).boundingBox();
    expect((redo?.x ?? 0) + (redo?.width ?? 0)).toBeLessThanOrEqual(
      (banner?.x ?? 0) + (banner?.width ?? 0),
    );
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await chooseTool(page, "직선");
    await drawLine(page, 100, isMobile);
    await page.screenshot({ path: testInfo.outputPath("history-buttons.png"), fullPage: true });
  });
});
