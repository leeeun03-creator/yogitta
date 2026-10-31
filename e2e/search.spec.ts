import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { card, openSample, searchBox } from "./search";

/** 검색창에 쓴다 (쓰는 대로 찾는다). */
const search = (page: Page, query: string) => searchBox(page).fill(query);

test.describe("검색하면 요깃따!와 위치 문장 카드 보여주기", () => {
  // 샘플 공간(내 방: 화장대 서랍장 2번째 서랍에 여권, 침대 밑에 겨울 이불, 옷장에 겨울 코트)으로 찾는다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
  });

  test("'여권'을 쓰면 요깃따!와 '1곳 찾음', 위치 문장, 메모가 뜬다", async ({ page }, testInfo) => {
    const errors = collectErrors(page);
    await search(page, "여권");
    await expect(card(page)).toContainText("'여권' 1곳 찾음");
    await expect(card(page)).toContainText(
      "여권은 내 방의 화장대 서랍장 위에서 2번째 서랍에 보관 중이에요.",
    );
    await expect(card(page)).toContainText("파란 파우치 안");
    await expect(card(page).getByText("화장대 서랍장", { exact: true })).toHaveCSS(
      "font-weight",
      "700",
    );
    await page.getByRole("button", { name: "확대" }).waitFor();
    await page.screenshot({ path: testInfo.outputPath("search.png") });
    expect(errors).toEqual([]);
  });

  test("띄어쓰기를 무시한다: '겨울이불'로 '겨울 이불'(침대 밑)을 찾고, 메모로도 찾는다", async ({
    page,
  }) => {
    await search(page, "겨울이불");
    await expect(card(page)).toContainText("겨울 이불은 내 방의 침대 밑에 보관 중이에요.");
    await search(page, "압축팩");
    await expect(card(page)).toContainText("겨울 이불은 내 방의 침대 밑에 보관 중이에요.");
  });

  test("여러 곳이면 '2곳 찾음'과 번호 목록으로 보인다", async ({ page }) => {
    await search(page, "겨울");
    await expect(card(page)).toContainText("'겨울' 2곳 찾음");
    await expect(card(page).getByRole("listitem")).toHaveText([
      "겨울 이불은 내 방의 침대 밑에 보관 중이에요.",
      "겨울 코트는 내 방의 옷장 왼쪽 문 위에서 1번째 칸에 보관 중이에요.",
    ]);
  });

  test("엣지: 공백만은 찾지 않고, 지우기 버튼·Esc로 지우면 카드가 닫힌다", async ({ page }) => {
    await search(page, "   ");
    await expect(card(page)).toHaveCount(0);
    await search(page, "여권");
    await expect(card(page)).toBeVisible();
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(card(page)).toHaveCount(0);
    await search(page, "여권");
    await searchBox(page).press("Escape");
    await expect(card(page)).toHaveCount(0);
  });

  test("엣지: 휴대폰은 가구 상세 패널 자리에 카드가 뜨고, 지우면 패널이 돌아온다", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "휴대폰 배치");
    const panel = page.getByRole("complementary", { name: "가구 상세 패널" });
    await search(page, "여권");
    await expect(card(page)).toBeInViewport();
    await expect(panel).toBeHidden();
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(panel).toBeVisible();
  });
});
