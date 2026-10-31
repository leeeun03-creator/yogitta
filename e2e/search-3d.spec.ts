import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { space3d } from "./scene";
import { card, openSample, searchBox } from "./search";

const foundLabels = (page: Page) => space3d(page).locator("[data-found]");
const SLIDE_DONE_MS = 500; // 칸 열림 애니메이션(300ms)이 끝난 뒤

test.describe("검색 결과를 3D에서 위치 표시하기", () => {
  // 샘플 공간(내 방)으로 찾는다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
  });

  test("여권을 찾으면 화장대 서랍장이 찾은 가구로 표시되고 2번째 서랍이 열린다 (3D 이름·라벨)", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await searchBox(page).fill("여권");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 화장대 서랍장, 2번째 서랍 열림$/);
    await expect(foundLabels(page)).toHaveText(["화장대 서랍장"]);
    await page.getByRole("button", { name: "확대" }).waitFor();
    await page.waitForTimeout(SLIDE_DONE_MS); // 서랍이 다 빠져나온 모양을 찍는다
    await page.screenshot({ path: testInfo.outputPath("found-3d.png") });
    expect(errors).toEqual([]);
  });

  test("결과를 고르면 찾은 가구가 따라가고(앞 칸은 닫히고 새 칸이 열림), 검색어를 지우면 원래대로", async ({
    page,
  }, testInfo) => {
    await searchBox(page).fill("겨울");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 침대$/); // 침대 밑은 열지 않는다
    await card(page).getByRole("listitem").nth(1).getByRole("button").click();
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 옷장, 왼쪽 1번째 칸 열림$/);
    await page.waitForTimeout(SLIDE_DONE_MS);
    await space3d(page).screenshot({ path: testInfo.outputPath("cabinet-open.png") });
    await expect(foundLabels(page)).toHaveText(["옷장"]);
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(space3d(page)).not.toHaveAccessibleName(/찾은 가구/);
    await expect(foundLabels(page)).toHaveCount(0);
  });

  test("선반은 그 칸이 열리고, 책상·칸 없음 물건은 열지 않고 가구만 강조한다", async ({ page }) => {
    await searchBox(page).fill("보드게임");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 책장, 3번째 선반 열림$/);
    await searchBox(page).fill("보조배터리");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 책상$/);
    await searchBox(page).fill("크리스마스");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 보관함$/);
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
