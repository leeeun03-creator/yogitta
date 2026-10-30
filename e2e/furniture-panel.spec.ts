import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { openDetails, panel as propertyPanel, placeBox, typeButton } from "./boxes";
import { addSpaceFromList, finishEditing, pill, spaceItem } from "./spaces";

const detail = (page: Page) => page.getByRole("complementary", { name: "가구 상세 패널" });
const furnitureButton = (page: Page, name: string) =>
  detail(page).getByRole("button", { name: new RegExp(`^${name} 물건 \\d+개$`) });
const rows = (page: Page) =>
  detail(page).getByRole("list", { name: "칸별 물건" }).locator(":scope > li");

/** 편집 모드에서 서랍장 하나를 놓고(칸 수를 rows로) 메인 화면으로 돌아간다. */
async function drawerOnMain(page: Page, isMobile: boolean, rowCount = 3) {
  await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
  await openDetails(page);
  await typeButton(page, "서랍장").click();
  const more = propertyPanel(page).getByRole("button", { name: "칸 늘리기" });
  for (let row = 3; row < rowCount; row++) await more.click();
  await finishEditing(page);
}

test.describe("메인 화면 가구 상세 패널", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("가구가 없으면 안내가 보인다", async ({ page }) => {
    await finishEditing(page);
    await expect(detail(page)).toContainText("아직 가구가 없어요. [편집]에서 가구를 놓아 보세요");
  });

  test("목록에서 가구를 고르면 칸별 행이 보이고, 닫으면 목록으로 돌아간다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await drawerOnMain(page, isMobile);
    await furnitureButton(page, "서랍장 1").click();
    await expect(detail(page).getByRole("heading", { name: "서랍장 1" })).toBeFocused();
    await expect(detail(page)).toContainText("구역 없음 · 물건 0개");
    await expect(rows(page)).toHaveText([
      "1번째 서랍비어 있어요",
      "2번째 서랍비어 있어요",
      "3번째 서랍비어 있어요",
    ]);
    await detail(page).getByRole("button", { name: "닫기" }).click();
    await expect(furnitureButton(page, "서랍장 1")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("엣지: 칸 8개 서랍장은 행 8개, Esc로도 닫힌다", async ({ page, isMobile }) => {
    await drawerOnMain(page, isMobile, 8);
    await furnitureButton(page, "서랍장 1").click();
    await expect(rows(page)).toHaveCount(8);
    await expect(rows(page).last()).toContainText("8번째 서랍");
    await page.keyboard.press("Escape");
    await expect(furnitureButton(page, "서랍장 1")).toBeVisible();
  });

  test("엣지: 공간을 바꾸면 열린 가구 상세 패널이 닫힌다", async ({ page, isMobile }) => {
    await drawerOnMain(page, isMobile);
    await furnitureButton(page, "서랍장 1").click();
    await addSpaceFromList(page, "형 방");
    await finishEditing(page);
    await pill(page, "형 방").click();
    await spaceItem(page, "내 방").click();
    await expect(furnitureButton(page, "서랍장 1")).toBeVisible();
  });

  test("엣지: 키보드만으로 목록에서 가구를 고른다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await drawerOnMain(page, isMobile);
    await furnitureButton(page, "서랍장 1").focus();
    await page.keyboard.press("Enter");
    await expect(detail(page).getByRole("heading", { name: "서랍장 1" })).toBeFocused();
  });

  test("엣지: 360px에서 패널은 3D 공간 아래에 있어 보기 버튼을 가리지 않는다", async ({
    page,
    isMobile,
  }, testInfo) => {
    test.skip(!isMobile, "휴대폰 화면에서만");
    await drawerOnMain(page, isMobile);
    await furnitureButton(page, "서랍장 1").click();
    const scene = await page.getByRole("region", { name: "3D 공간 영역" }).boundingBox();
    const sheet = await detail(page).boundingBox();
    expect(sheet?.y ?? 0).toBeGreaterThanOrEqual((scene?.y ?? 0) + (scene?.height ?? 0));
    await expect(page.getByRole("button", { name: "확대" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("furniture-panel.png"), fullPage: true });
  });

  test("스크린샷을 남긴다 (시안 01과 비교)", async ({ page, isMobile }, testInfo) => {
    test.skip(isMobile, "휴대폰은 위 테스트에서 찍는다");
    await drawerOnMain(page, isMobile);
    await furnitureButton(page, "서랍장 1").click();
    await page.waitForTimeout(300); // 3D가 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("furniture-panel.png"), fullPage: true });
  });
});
