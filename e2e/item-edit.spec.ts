import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { addItem, chips, form, openDrawer, row } from "./items";
import { detail } from "./scene";
import { finishEditing } from "./spaces";

const bar = (page: Page, name: string) =>
  detail(page).getByRole("region", { name: `${name} 물건` });
const editForm = (page: Page) => form(page, "물건 고치기");

/** 칩을 눌러 자세한 내용을 열고 [고치기]를 누른다. */
async function openEdit(page: Page, slot: string, name: string) {
  await chips(page, slot).filter({ hasText: name }).click();
  await bar(page, name).getByRole("button", { name: "고치기" }).click();
}

/** 편집 모드에서 [되돌리기]를 한 번 누르고 메인 화면으로 와 서랍장 1을 다시 연다 (메인 화면에는 되돌리기가 없다). */
async function undoOnce(page: Page) {
  await page.getByRole("button", { name: "편집" }).click();
  await page.getByRole("button", { name: "되돌리기" }).click();
  await finishEditing(page);
  await detail(page)
    .getByRole("button", { name: /^서랍장 1 물건/ })
    .click();
}

test.describe("가구 상세 패널에서 물건의 이름·칸·메모 고치기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await openDrawer(page, isMobile);
    await addItem(page, { name: "여권", slot: "1번째 서랍", memo: "파란 파우치" });
    await addItem(page, { name: "양말", slot: "1번째 서랍" });
  });

  test("[고치기]는 지금 값이 채워진 채 열리고, 이름·메모를 고치면 바뀐다 (넣은 순서는 그대로)", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await openEdit(page, "1번째 서랍", "여권");
    const name = editForm(page).getByLabel("물건 이름");
    await expect(name).toHaveValue("여권");
    await expect(name).toBeFocused();
    await expect(editForm(page).getByLabel("칸")).toHaveValue("0");
    await expect(editForm(page).getByLabel("메모 (선택)")).toHaveValue("파란 파우치");
    await name.fill("여권 지갑");
    await editForm(page).getByLabel("메모 (선택)").fill("서랍 안쪽");
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(editForm(page)).toHaveCount(0);
    await expect(chips(page, "1번째 서랍")).toHaveText(["여권 지갑", "양말"]);
    await expect(bar(page, "여권 지갑")).toContainText("여권 지갑 · 1번째 서랍");
    await expect(bar(page, "여권 지갑")).toContainText("서랍 안쪽");
    await detail(page).screenshot({ path: testInfo.outputPath("item-bar.png") });
    expect(errors).toEqual([]);
  });

  test("칸을 바꾸면 그 칸으로 옮겨지고, 되돌리기 한 번에 원래 칸으로 돌아온다", async ({
    page,
  }) => {
    await openEdit(page, "1번째 서랍", "여권");
    await editForm(page).getByLabel("칸").selectOption({ label: "3번째 서랍" });
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(chips(page, "3번째 서랍")).toHaveText(["여권"]);
    await expect(chips(page, "1번째 서랍")).toHaveText(["양말"]);
    await undoOnce(page);
    await expect(chips(page, "1번째 서랍")).toHaveText(["여권", "양말"]);
    await expect(row(page, "3번째 서랍")).toContainText("비어 있어요");
  });

  test("엣지: 칸 없음으로 옮기면 칸 없음 행에 들어간다 (Enter로 저장)", async ({ page }) => {
    await openEdit(page, "1번째 서랍", "양말");
    await editForm(page).getByLabel("칸").selectOption({ label: "칸 없음" });
    await editForm(page).getByLabel("물건 이름").press("Enter");
    await expect(chips(page, "칸 없음")).toHaveText(["양말"]);
  });

  test("엣지: 빈 이름·31자는 막고 까닭이 뜨며 물건은 그대로다", async ({ page }) => {
    await openEdit(page, "1번째 서랍", "여권");
    const name = editForm(page).getByLabel("물건 이름");
    await name.fill("   ");
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(name).toHaveAccessibleDescription("물건 이름을 써 주세요");
    await name.fill("가".repeat(31));
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(name).toHaveAccessibleDescription("물건 이름은 30자까지 쓸 수 있어요");
    await expect(chips(page, "1번째 서랍")).toHaveText(["여권", "양말"]);
  });

  test("엣지: Esc·[취소]는 고치기만 닫고 자세한 내용으로 돌아오며, 고친 글자는 버린다", async ({
    page,
  }) => {
    await openEdit(page, "1번째 서랍", "여권");
    await editForm(page).getByLabel("물건 이름").fill("바뀐 이름");
    await editForm(page).getByLabel("물건 이름").press("Escape");
    await expect(editForm(page)).toHaveCount(0);
    await expect(bar(page, "여권")).toBeVisible(); // 가구 상세 패널은 그대로
    await bar(page, "여권").getByRole("button", { name: "고치기" }).click();
    await expect(editForm(page).getByLabel("물건 이름")).toHaveValue("여권");
    await editForm(page).getByRole("button", { name: "취소" }).click();
    await expect(bar(page, "여권")).toBeVisible();
    await expect(chips(page, "1번째 서랍")).toHaveText(["여권", "양말"]);
  });

  test("엣지: 바꾸지 않고 저장하면 되돌리기 기록이 남지 않는다 (되돌리기는 그 전 넣기를 되돌린다)", async ({
    page,
  }) => {
    await openEdit(page, "1번째 서랍", "여권");
    await editForm(page).getByRole("button", { name: "저장" }).click();
    await expect(editForm(page)).toHaveCount(0);
    await undoOnce(page);
    await expect(chips(page, "1번째 서랍")).toHaveText(["여권"]); // 양말 넣기가 되돌려졌다
  });
});
