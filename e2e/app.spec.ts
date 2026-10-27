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

  test("제목은 Jua, 본문은 Gowun Dodum 글꼴이 적용된다", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() => document.fonts.ready);

    const heading = page.getByRole("heading", { name: "요깃따" });
    await expect(heading).toHaveCSS("font-family", /Jua/);
    await expect(page.locator("body")).toHaveCSS("font-family", /Gowun Dodum/);
    expect(await page.evaluate(() => document.fonts.check('16px "Jua"', "요깃따"))).toBe(true);
  });

  test("바탕색이 디자인 토큰 --yg-bg 다", async ({ page }) => {
    await page.goto("./");
    // #F4ECDF
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 236, 223)");
  });

  test("가로 스크롤이 생기지 않는다", async ({ page }) => {
    await page.goto("./");
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test("화면을 스크린샷으로 남긴다", async ({ page }, testInfo) => {
    await page.goto("./");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath("first-screen.png"), fullPage: true });
  });
});

test.describe("엣지 케이스", () => {
  test("글꼴 서버가 막혀도 화면은 뜬다", async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "요깃따" })).toBeVisible();
  });

  // GitHub Pages는 /yogitta → /yogitta/ 로 넘겨주지만 로컬 vite preview는 넘겨주지 않아서 배포 주소에서만 검사한다.
  test("주소 끝의 / 가 없어도 열린다 (배포 주소)", async ({ page, baseURL }) => {
    test.skip(!process.env.E2E_BASE_URL, "배포 주소(E2E_BASE_URL)를 검사할 때만 돈다");
    const withoutSlash = (baseURL ?? "").replace(/\/$/, "");
    await page.goto(withoutSlash);
    await expect(page.getByRole("heading", { name: "요깃따" })).toBeVisible();
  });
});
