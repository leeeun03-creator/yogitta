import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { openDetails, placeBox, typeButton } from "./boxes";
import { addItem, chips, editForm, openEdit, row, undoOnce } from "./items";
import { detail } from "./scene";
import { finishEditing } from "./spaces";

const listButton = (page: Page, name: string) =>
  detail(page).getByRole("button", { name: new RegExp(`^${name} 물건`) });
const notice = (page: Page) => detail(page).getByRole("status");
const checked = (page: Page, label: "가구" | "칸") =>
  editForm(page).getByLabel(label).locator("option:checked");

test.describe("가구 상세 패널에서 물건을 다른 가구로 옮기기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 350, y: 50 }, { x: 500, y: 150 }, isMobile); // 보관함 1
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 보관함 2 → 서랍장 1
    await openDetails(page);
    await typeButton(page, "서랍장").click();
    await finishEditing(page);
    await listButton(page, "서랍장 1").click();
    await addItem(page, { name: "여권", slot: "2번째 서랍" });
    await addItem(page, { name: "양말", slot: "1번째 서랍" });
  });

  test("[가구]를 바꾸면 칸이 그 가구 칸으로 바뀌고, 저장하면 옮겨지며 안내가 뜬다", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await openEdit(page, "2번째 서랍", "여권");
    await expect(checked(page, "가구")).toHaveText("서랍장 1");
    await editForm(page).getByLabel("가구").selectOption({ label: "보관함 1" });
    await expect(checked(page, "칸")).toHaveText("칸 없음"); // 가구를 바꾸면 칸은 칸 없음부터
    await expect(editForm(page).getByLabel("칸").locator("option")).toHaveText([
      "보관함 안",
      "칸 없음",
    ]);
    await editForm(page).getByLabel("칸").selectOption({ label: "보관함 안" });
    await editForm(page).screenshot({ path: testInfo.outputPath("move-form.png") });
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(notice(page)).toHaveText("여권을 보관함 1에 옮겼어요");
    await detail(page).screenshot({ path: testInfo.outputPath("moved.png") });
    await expect(row(page, "2번째 서랍")).toContainText("비어 있어요");
    await expect(detail(page)).toContainText("물건 1개");
    await chips(page, "1번째 서랍").first().click(); // 다른 물건을 누르면 안내가 지워진다
    await expect(notice(page)).toBeHidden();
    await detail(page).getByRole("button", { name: "닫기" }).first().click();
    await expect(listButton(page, "보관함 1")).toHaveAccessibleName("보관함 1 물건 1개");
    await listButton(page, "보관함 1").click();
    await expect(chips(page, "보관함 안")).toHaveText(["여권"]);
    expect(errors).toEqual([]);
  });

  test("엣지: 되돌리기 한 번에 원래 가구·칸으로 돌아온다", async ({ page }) => {
    await openEdit(page, "2번째 서랍", "여권");
    await editForm(page).getByLabel("가구").selectOption({ label: "보관함 1" });
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(notice(page)).toHaveText("여권을 보관함 1에 옮겼어요");
    await undoOnce(page, "서랍장 1");
    await expect(chips(page, "2번째 서랍")).toHaveText(["여권"]);
  });

  test("엣지: 칸을 안 고르고 옮기면 그 가구의 칸 없음에 들어가고, 이름도 함께 고칠 수 있다", async ({
    page,
  }) => {
    await openEdit(page, "1번째 서랍", "양말");
    await editForm(page).getByLabel("물건 이름").fill("겨울 양말");
    await editForm(page).getByLabel("가구").selectOption({ label: "보관함 1" });
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(notice(page)).toHaveText("겨울 양말을 보관함 1에 옮겼어요");
    await detail(page).getByRole("button", { name: "닫기" }).first().click();
    await listButton(page, "보관함 1").click();
    await expect(chips(page, "칸 없음")).toHaveText(["겨울 양말"]);
  });
});
