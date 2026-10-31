import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { resetView, space3d } from "./scene";
import { card, openSample, searchBox } from "./search";

const pins = (page: Page) => space3d(page).getByTestId("pin");
const pickedPin = (page: Page) => space3d(page).locator("[data-testid=pin][data-picked]");
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
    await expect(pins(page)).toHaveCount(1);
    await expect(pickedPin(page)).toContainText("여권");
    await expect(pickedPin(page)).toContainText("화장대 서랍장 · 2번째 서랍");
    // 핀이 있는 가구는 이름 라벨 대신 핀으로 보인다
    await expect(
      space3d(page).getByTestId("box-label").filter({ hasText: "화장대 서랍장" }),
    ).toHaveCount(0);
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
    await expect(pickedPin(page)).toContainText("겨울 코트");
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(space3d(page)).not.toHaveAccessibleName(/찾은 가구/);
    await expect(pins(page)).toHaveCount(0);
  });

  test("선반은 그 칸이 열리고, 책상·칸 없음 물건은 열지 않고 가구만 강조한다", async ({ page }) => {
    await searchBox(page).fill("보드게임");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 책장, 3번째 선반 열림$/);
    await searchBox(page).fill("보조배터리");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 책상$/);
    await searchBox(page).fill("크리스마스");
    await expect(space3d(page)).toHaveAccessibleName(/, 찾은 가구 보관함$/);
  });

  test("여러 곳이면 결과마다 핀이 뜨고, 고른 결과의 핀만 진하다", async ({ page }) => {
    await searchBox(page).fill("겨울");
    await expect(pins(page)).toHaveCount(2);
    await expect(pickedPin(page)).toContainText("겨울 이불");
    await expect(pickedPin(page)).toContainText("침대 · 침대 밑");
    await card(page).getByRole("listitem").nth(1).getByRole("button").click();
    await expect(pickedPin(page)).toContainText("옷장 · 왼쪽 1번째 칸");
    await expect(pins(page)).toHaveCount(2);
  });

  test("엣지: 칸 없음 물건은 가구 위 핀에 '칸 없음', 핀이 보기 버튼을 가리지 않는다", async ({
    page,
  }) => {
    await searchBox(page).fill("크리스마스");
    await expect(pickedPin(page)).toContainText("보관함 · 칸 없음");
    await page.getByRole("button", { name: "확대" }).click(); // 핀에 가리면 누르지 못한다
    await resetView(page).click();
    await expect(pickedPin(page)).toBeVisible();
  });

  test("엣지: 다른 공간에만 있거나 결과가 없으면 위치 표시가 없다", async ({ page }) => {
    await searchBox(page).fill("충전기"); // 형 방에만 있다
    await expect(card(page)).toBeVisible();
    await expect(space3d(page)).not.toHaveAccessibleName(/찾은 가구/);
    await searchBox(page).fill("선크림");
    await expect(page.getByRole("region", { name: "아직 어딨는지 몰라요" })).toBeVisible();
    await expect(pins(page)).toHaveCount(0);
  });
});
