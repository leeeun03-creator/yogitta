import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, pressCm } from "./helpers";
import { boxButton, FLOOR, panel, placeBox } from "./boxes";
import { addItem, chips } from "./items";
import { detail } from "./scene";
import { finishEditing } from "./spaces";

const listButton = (page: Page, name: string) =>
  detail(page).getByRole("button", { name: new RegExp(`^${name} 물건`) });
const dialog = (page: Page) => page.getByRole("alertdialog", { name: "보관함 1을 지울까요?" });
const removeButton = (page: Page) => panel(page).getByRole("button", { name: "삭제" });
const BOX1 = { x: 425, y: 100 }; // 보관함 1 가운데 (cm), 여권·양말이 든다
const BOX2 = { x: 200, y: 125 }; // 보관함 2 가운데 (cm), 비어 있다

/** 편집 모드로 가서 2D 평면도의 그 자리 가구를 고른다. */
async function editAndSelect(page: Page, at: { x: number; y: number }, isMobile: boolean) {
  await page.getByRole("button", { name: "편집" }).click();
  await pressCm(page, FLOOR, [at], isMobile);
}

/** 메인 화면으로 와 가구 목록의 물건 수를 본다. */
async function expectCounts(page: Page, counts: Record<string, number>) {
  await finishEditing(page);
  for (const [name, count] of Object.entries(counts))
    await expect(listButton(page, name)).toHaveAccessibleName(`${name} 물건 ${count}개`);
}

test.describe("물건 든 가구를 지울 때 같이 지울지·다른 가구로 옮길지 묻기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 350, y: 50 }, { x: 500, y: 150 }, isMobile); // 보관함 1
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 보관함 2
    await finishEditing(page);
    await listButton(page, "보관함 1").click();
    await addItem(page, { name: "여권", slot: "보관함 안" });
    await addItem(page, { name: "양말" });
    await editAndSelect(page, BOX1, isMobile);
  });

  test("[삭제]하면 삭제 확인이 뜨고(처음 초점은 취소), [같이 지우기]는 물건까지 지운다", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await removeButton(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toHaveAccessibleDescription(
      "물건 2개가 들어 있어요. 다른 가구의 칸 없음으로 옮기거나 같이 지울 수 있어요",
    );
    await expect(dialog(page).getByRole("button", { name: "취소" })).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("remove-dialog.png") });
    await dialog(page).getByRole("button", { name: "같이 지우기" }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(boxButton(page, "보관함 1")).toHaveCount(0);
    await expectCounts(page, { "보관함 2": 0 });
    expect(errors).toEqual([]);
  });

  test("[옮기고 지우기]는 고른 가구의 칸 없음으로 옮긴 뒤 지우고, 되돌리기 한 번에 함께 돌아온다", async ({
    page,
  }) => {
    await removeButton(page).click();
    await expect(dialog(page).getByLabel("옮길 가구")).toHaveValue(/.+/);
    await dialog(page).getByLabel("옮길 가구").selectOption({ label: "보관함 2" });
    await dialog(page).getByRole("button", { name: "옮기고 지우기" }).click();
    await expect(boxButton(page, "보관함 1")).toHaveCount(0);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(boxButton(page, "보관함 1")).toHaveCount(1);
    await page.getByRole("button", { name: "다시하기" }).click();
    await expectCounts(page, { "보관함 2": 2 });
    await listButton(page, "보관함 2").click();
    await expect(chips(page, "칸 없음")).toHaveText(["여권", "양말"]);
  });

  test("엣지: Esc·[취소]는 지우지 않는다", async ({ page }) => {
    await removeButton(page).click();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
    await removeButton(page).click();
    await dialog(page).getByRole("button", { name: "취소" }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expectCounts(page, { "보관함 1": 2, "보관함 2": 0 });
  });

  test("엣지: 빈 가구는 묻지 않고 바로 지운다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [BOX2], isMobile);
    await removeButton(page).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(boxButton(page, "보관함 2")).toHaveCount(0);
  });

  test("엣지: 지우개·Delete 키로 지워도 묻는다", async ({ page, isMobile }) => {
    await chooseTool(page, "지우개");
    await pressCm(page, FLOOR, [BOX1], isMobile);
    await expect(dialog(page)).toBeVisible();
    await dialog(page).getByRole("button", { name: "취소" }).click();
    if (isMobile) return; // 키보드는 데스크톱에서만
    await chooseTool(page, "선택");
    await boxButton(page, "보관함 1").focus();
    await page.keyboard.press("Delete");
    await expect(dialog(page)).toBeVisible();
  });

  test("엣지: 다른 가구가 없으면 옮기기 없이 같이 지우기만 묻는다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [BOX2], isMobile);
    await removeButton(page).click(); // 빈 보관함 2를 먼저 지운다
    await pressCm(page, FLOOR, [BOX1], isMobile);
    await removeButton(page).click();
    await expect(dialog(page)).toHaveAccessibleDescription(
      "물건 2개가 들어 있어요. 가구를 지우면 물건도 같이 지워져요",
    );
    await expect(dialog(page).getByLabel("옮길 가구")).toHaveCount(0);
  });
});
