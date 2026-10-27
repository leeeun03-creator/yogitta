import { expect, test } from "@playwright/test";

// 색 값은 tokens.css와 같다 (브라우저는 rgb로 돌려준다)
const ACCENT_HOVER = "rgb(124, 58, 18)"; // --yg-accent-hover #7C3A12
const DISABLED_TEXT = "rgb(143, 122, 102)"; // --yg-disabled-text #8F7A66

test.describe("첫 실행 화면", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("공간이 없으면 안내 문구와 버튼이 보인다", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "아직 공간이 없어요" })).toBeVisible();
    await expect(page.getByText("벽을 그려서 내 방을 만들어 보세요.")).toBeVisible();
    // 점선 + 타일과 주 버튼, 두 곳에서 새 공간을 만들 수 있다
    await expect(page.getByRole("button", { name: "새 공간 만들기" })).toHaveCount(2);
  });

  test("샘플 공간 버튼은 준비 전이라 비활성이고 안내가 붙어 있다", async ({ page }) => {
    const sample = page.getByRole("button", { name: "샘플 공간 둘러보기" });
    await expect(sample).toBeDisabled();
    await expect(sample).toHaveAccessibleDescription("샘플 공간은 준비 중이에요.");
    await expect(sample).toHaveCSS("color", DISABLED_TEXT);
  });

  test("주 버튼에 올리면 올림 색이 된다", async ({ page, isMobile }) => {
    test.skip(isMobile, "모바일에는 올림(hover)이 없다");
    const primary = page.getByRole("button", { name: "새 공간 만들기" }).last();
    await primary.hover();
    await expect(primary).toHaveCSS("background-color", ACCENT_HOVER);
  });

  test("키보드 Tab으로 이동하면 포커스 테두리가 보인다", async ({ page, isMobile }) => {
    test.skip(isMobile, "모바일에는 키보드 Tab 이동이 없다");
    // 순서: 점선 + 타일 → 주 버튼 (비활성인 샘플 버튼은 건너뛴다)
    const tile = page.getByRole("button", { name: "새 공간 만들기" }).first();
    const primary = page.getByRole("button", { name: "새 공간 만들기" }).last();
    for (const target of [tile, primary]) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
      await expect(target).toHaveCSS("outline-style", "solid");
      await expect(target).toHaveCSS("outline-width", "2px");
    }
  });

  test("카드가 화면 폭 안에 들어간다", async ({ page }) => {
    const card = page.locator("section", { has: page.getByRole("heading", { level: 1 }) });
    const box = await card.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(box).not.toBeNull();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
  });

  test("스크린샷을 남긴다 (시안 03과 비교)", async ({ page }, testInfo) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath("empty-screen.png"), fullPage: true });
  });
});
