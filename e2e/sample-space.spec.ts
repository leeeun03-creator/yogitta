import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { addItem, chips, listButton } from "./items";
import { mainTitle, pill, spaceItem } from "./spaces";

const space3d = (page: Page) => page.getByRole("img", { name: /^3D 공간,/ });

test.describe("첫 접속에 샘플 공간 보여주기", () => {
  // 저장된 값이 없는 첫 접속 (다른 실제 테스트는 공간 없는 저장 데이터로 시작한다)
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await expect(mainTitle(page)).toBeVisible();
  });

  test("처음 열면 샘플 공간 내 방(벽·구역·가구·물건)이 메인 화면에 바로 보인다", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await expect(pill(page)).toBeVisible();
    await expect(space3d(page)).toHaveAccessibleName(
      "3D 공간, 바닥 6.0 × 4.5 m, 벽 1개, 선분 4개, 구역 2개, 가구 6개",
    );
    await expect(listButton(page, "화장대 서랍장")).toHaveAccessibleName("화장대 서랍장 물건 4개");
    await listButton(page, "화장대 서랍장").click();
    await expect(chips(page, "2번째 서랍")).toHaveText(["여권", "비상금"]);
    await expect(page.getByRole("complementary", { name: "가구 상세 패널" })).toContainText(
      "구역 침실",
    );
    await page.getByRole("button", { name: "확대" }).waitFor();
    await page.screenshot({ path: testInfo.outputPath("sample.png") });
    expect(errors).toEqual([]);
  });

  test("공간 바꾸기로 형 방을 연다", async ({ page }) => {
    await pill(page).click();
    await spaceItem(page, "형 방").click();
    await expect(pill(page, "형 방")).toBeVisible();
    await expect(listButton(page, "형 책상")).toHaveAccessibleName("형 책상 물건 1개");
  });

  test("엣지: 샘플을 고치고 새로고침하면 고친 것이 남는다", async ({ page }) => {
    await listButton(page, "보관함").click();
    await addItem(page, { name: "여름 옷" });
    await page.reload();
    await expect(listButton(page, "보관함")).toHaveAccessibleName("보관함 물건 2개");
  });

  test("엣지: 고치지 않고 새로고침하면 다시 샘플 공간이다", async ({ page }) => {
    await page.reload();
    await expect(listButton(page, "화장대 서랍장")).toHaveAccessibleName("화장대 서랍장 물건 4개");
  });
});
