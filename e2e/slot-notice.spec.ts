import { expect, test, type Page } from "@playwright/test";
import { createSpace, pressCm } from "./helpers";
import { FLOOR, openDetails, panel, placeBox, typeButton } from "./boxes";
import { addItem, chips } from "./items";
import { detail } from "./scene";
import { finishEditing } from "./spaces";

const listButton = (page: Page, name: string) =>
  detail(page).getByRole("button", { name: new RegExp(`^${name} 물건`) });
// 칸 수 표시(output)도 status라 알림 문구로 고른다
const notice = (page: Page) => panel(page).getByRole("status").filter({ hasText: "옮겼어요" });
const fewer = (page: Page) => panel(page).getByRole("button", { name: "칸 줄이기" });
const DRAWER_CENTER = { x: 200, y: 125 }; // 서랍장 1 가운데 (cm)
const BOX_CENTER = { x: 425, y: 100 }; // 보관함 1 가운데 (cm)

/** 메인 화면에서 서랍장 1을 열어 둔 채, 편집 모드로 가서 서랍장 1을 고르고 종류·크기를 편다. */
async function editDrawer(page: Page, isMobile: boolean) {
  await page.getByRole("button", { name: "편집" }).click();
  await pressCm(page, FLOOR, [DRAWER_CENTER], isMobile);
  await openDetails(page);
}

test.describe("칸 수를 줄이면 칸 없음으로 옮긴 물건 알리기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  // 서랍장 1(4칸)의 4번째 서랍에 양말·장갑, 1번째 서랍에 여권. 옆에 보관함 1
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 350, y: 50 }, { x: 500, y: 150 }, isMobile);
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await openDetails(page);
    await typeButton(page, "서랍장").click();
    await panel(page).getByRole("button", { name: "칸 늘리기" }).click();
    await finishEditing(page);
    await listButton(page, "서랍장 1").click();
    await addItem(page, { name: "양말", slot: "4번째 서랍" });
    await addItem(page, { name: "장갑", slot: "4번째 서랍" });
    await addItem(page, { name: "여권", slot: "1번째 서랍" });
    await editDrawer(page, isMobile);
  });

  test("4번째 서랍에 물건이 있을 때 3칸으로 줄이면 칸 없음으로 가고 알림이 뜬다", async ({
    page,
  }, testInfo) => {
    await fewer(page).click();
    await expect(notice(page)).toHaveText("물건 2개를 칸 없음으로 옮겼어요");
    await expect(notice(page)).toBeInViewport(); // 휴대폰 속성 패널이 스크롤돼도 보인다
    await page.screenshot({ path: testInfo.outputPath("slot-notice.png") });
    await finishEditing(page);
    await listButton(page, "서랍장 1").click();
    await expect(chips(page, "칸 없음")).toHaveText(["양말", "장갑"]);
    await expect(chips(page, "1번째 서랍")).toHaveText(["여권"]);
  });

  test("엣지: 사라진 칸이 비었으면 알림이 없다", async ({ page }) => {
    await fewer(page).click(); // 4 → 3: 양말·장갑
    await fewer(page).click(); // 3 → 2: 3번째 서랍은 비어 있다
    await expect(panel(page).getByText("2칸")).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
  });

  test("엣지: 칸이 적은 종류(보관함)로 바꿔도 알린다", async ({ page }) => {
    await typeButton(page, "보관함").click();
    await expect(notice(page)).toHaveText("물건 2개를 칸 없음으로 옮겼어요"); // 1번째 서랍 = 보관함 안
  });

  test("엣지: 되돌리면 원래 칸으로 돌아오고 알림이 사라진다", async ({ page }) => {
    await fewer(page).click();
    await expect(notice(page)).toBeVisible();
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(notice(page)).toHaveCount(0);
    await finishEditing(page);
    await listButton(page, "서랍장 1").click();
    await expect(chips(page, "4번째 서랍")).toHaveText(["양말", "장갑"]);
  });

  test("엣지: 다른 가구를 고르면 알림이 사라진다", async ({ page, isMobile }) => {
    await fewer(page).click();
    await expect(notice(page)).toBeVisible();
    await pressCm(page, FLOOR, [BOX_CENTER], isMobile);
    await expect(panel(page).getByRole("textbox", { name: "가구 이름" })).toHaveValue("보관함 1");
    await expect(notice(page)).toHaveCount(0);
  });
});
