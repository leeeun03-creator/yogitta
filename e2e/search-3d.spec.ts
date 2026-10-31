import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { space3d } from "./scene";
import { card, openSample, searchBox } from "./search";

const foundLabels = (page: Page) => space3d(page).locator("[data-found]");

test.describe("검색 결과를 3D에서 위치 표시하기", () => {
  // 샘플 공간(내 방)으로 찾는다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
  });

  test("여권을 찾으면 화장대 서랍장이 찾은 가구로 표시된다 (3D 이름·라벨)", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await searchBox(page).fill("여권");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 화장대 서랍장$/);
    await expect(foundLabels(page)).toHaveText(["화장대 서랍장"]);
    await page.getByRole("button", { name: "확대" }).waitFor();
    await page.screenshot({ path: testInfo.outputPath("found-3d.png") });
    expect(errors).toEqual([]);
  });

  test("결과를 고르면 찾은 가구가 따라가고, 검색어를 지우면 원래대로", async ({ page }) => {
    await searchBox(page).fill("겨울");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 침대$/);
    await card(page).getByRole("listitem").nth(1).getByRole("button").click();
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 옷장$/);
    await expect(foundLabels(page)).toHaveText(["옷장"]);
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(space3d(page)).not.toHaveAccessibleName(/찾은 가구/);
    await expect(foundLabels(page)).toHaveCount(0);
  });

  test("엣지: 다른 공간에만 있거나 결과가 없으면 위치 표시가 없다", async ({ page }) => {
    await searchBox(page).fill("충전기"); // 형 방에만 있다
    await expect(card(page)).toBeVisible();
    await expect(space3d(page)).not.toHaveAccessibleName(/찾은 가구/);
    await searchBox(page).fill("선크림");
    await expect(page.getByRole("region", { name: "아직 어딨는지 몰라요" })).toBeVisible();
    await expect(foundLabels(page)).toHaveCount(0);
  });
});
