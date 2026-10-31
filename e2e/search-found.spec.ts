import { expect, test, type Page } from "@playwright/test";
import { chips, row } from "./items";
import { detail } from "./scene";
import { card, openSample, searchBox } from "./search";

const heading = (page: Page, name: string) => detail(page).getByRole("heading", { name });
const FOUND_BG = "rgb(246, 217, 191)"; // --yg-found-bg #F6D9BF
const ACCENT = "rgb(168, 80, 27)"; // --yg-accent #A8501B

test.describe("찾은 가구를 가구 상세 패널에 열고 찾은 칸 강조하기", () => {
  // 샘플 공간(내 방)으로 찾는다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
  });

  test("여권을 찾으면 화장대 서랍장이 열리고 2번째 서랍 행과 여권 칩이 강조된다", async ({
    page,
    isMobile,
  }, testInfo) => {
    await searchBox(page).fill("여권");
    if (isMobile) await card(page).getByRole("button", { name: "화장대 서랍장 전체 보기" }).click();
    await expect(heading(page, "화장대 서랍장")).toBeVisible();
    await expect(row(page, "2번째 서랍")).toHaveCSS("background-color", FOUND_BG);
    const passport = chips(page, "2번째 서랍").filter({ hasText: "여권" });
    await expect(passport).toHaveCSS("background-color", ACCENT);
    await expect(passport).toHaveCSS("font-weight", "700"); // 색만으로 구분하지 않게 굵게
    await expect(chips(page, "2번째 서랍").filter({ hasText: "비상금" })).not.toHaveCSS(
      "background-color",
      ACCENT,
    );
    await expect(row(page, "1번째 서랍")).not.toHaveCSS("background-color", FOUND_BG);
    await page.screenshot({ path: testInfo.outputPath("found.png") });
  });

  test("여러 곳이면 결과 행을 눌러 고르고, 고른 가구가 열린다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휴대폰은 카드와 패널을 번갈아 본다 (다음 테스트)");
    await searchBox(page).fill("겨울");
    await expect(heading(page, "침대")).toBeVisible(); // 처음엔 첫 결과
    const rows = card(page).getByRole("listitem").getByRole("button");
    await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
    await rows.nth(1).click();
    await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(heading(page, "옷장")).toBeVisible();
    await expect(row(page, "왼쪽 1번째 칸")).toHaveCSS("background-color", FOUND_BG);
  });

  test("엣지: 휴대폰은 [가구 전체 보기]로 패널을 보고, 검색어를 바꾸면 카드가 돌아온다", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "휴대폰 배치");
    await searchBox(page).fill("여권");
    await expect(detail(page)).toBeHidden();
    await card(page).getByRole("button", { name: "화장대 서랍장 전체 보기" }).click();
    await expect(card(page)).toBeHidden();
    await expect(heading(page, "화장대 서랍장")).toBeVisible();
    await searchBox(page).fill("여권 ");
    await expect(card(page)).toBeVisible();
  });

  test("엣지: 칸 없음 물건은 칸 없음 행이 강조되고, 검색어를 지우면 강조가 사라진다", async ({
    page,
    isMobile,
  }) => {
    await searchBox(page).fill("크리스마스");
    if (isMobile) await card(page).getByRole("button", { name: "보관함 전체 보기" }).click();
    await expect(heading(page, "보관함")).toBeVisible();
    await expect(row(page, "칸 없음")).toHaveCSS("background-color", FOUND_BG);
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(heading(page, "보관함")).toBeVisible(); // 열린 패널은 그대로
    await expect(row(page, "칸 없음")).not.toHaveCSS("background-color", FOUND_BG);
  });
});
