import { expect, test, type Page } from "@playwright/test";

/** 페이지에서 난 콘솔 에러와 처리 안 된 예외를 모은다. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("첫 화면", () => {
  test("로고가 보이고 콘솔 에러가 없다", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("./");

    await expect(page).toHaveTitle("요깃따");
    await expect(page.getByRole("heading", { name: "요깃따" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("가로 스크롤이 생기지 않는다", async ({ page }) => {
    await page.goto("./");
    // 설정한 화면 폭과 비교해서, 실패하면 몇 px로 넘쳤는지 바로 보이게 한다.
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(contentWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("화면을 스크린샷으로 남긴다", async ({ page }, testInfo) => {
    await page.goto("./");
    await page.screenshot({ path: testInfo.outputPath("first-screen.png"), fullPage: true });
  });
});
