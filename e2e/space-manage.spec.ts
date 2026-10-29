import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";
import { addSpaceFromList, finishEditing, openMain, pill, spaceItem, spaceList } from "./spaces";

const moreButton = (page: Page, name: string) =>
  spaceList(page).getByRole("button", { name: `${name} 이름 바꾸기·삭제` });
const nameInput = (page: Page) => spaceList(page).getByRole("textbox", { name: "공간 이름" });
const confirm = (page: Page) => page.getByRole("alertdialog");

/** 목록을 열고 name 줄의 "⋯" → [이름 바꾸기]·[삭제] 중 하나를 누른다. */
async function rowAction(
  page: Page,
  current: string,
  name: string,
  action: "이름 바꾸기" | "삭제",
) {
  await pill(page, current).click();
  await moreButton(page, name).click();
  await spaceList(page).getByRole("button", { name: action, exact: true }).click();
}

/** 내 방·형 방을 만들고 형 방의 메인 화면에서 끝난다. */
async function twoSpaces(page: Page) {
  await openMain(page);
  await addSpaceFromList(page, "형 방");
  await finishEditing(page);
}

test.describe("공간 이름 바꾸기", () => {
  test.beforeEach(async ({ page }) => {
    await twoSpaces(page);
  });

  test("⋯ → 이름 바꾸기 → Enter면 목록·알약 이름이 바뀌고 초점이 그 공간으로 온다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await pill(page, "형 방").click();
    await expect(moreButton(page, "형 방")).toHaveAttribute("aria-expanded", "false");
    await moreButton(page, "형 방").click();
    await expect(moreButton(page, "형 방")).toHaveAttribute("aria-expanded", "true");
    await spaceList(page).getByRole("button", { name: "이름 바꾸기", exact: true }).click();
    await expect(nameInput(page)).toBeFocused();
    await expect(nameInput(page)).toHaveValue("형 방");
    await nameInput(page).fill("서재");
    await nameInput(page).press("Enter");
    await expect(spaceItem(page, "서재")).toBeFocused();
    await expect(pill(page, "서재")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("엣지: 빈 이름·다른 공간과 같은 이름은 안내하고, 고쳐 쓰면 안내가 사라진다", async ({
    page,
  }) => {
    await rowAction(page, "형 방", "형 방", "이름 바꾸기");
    await nameInput(page).fill("  ");
    await nameInput(page).press("Enter");
    await expect(spaceList(page).getByRole("alert")).toHaveText("공간 이름을 적어 주세요");
    await nameInput(page).fill("내 방");
    await expect(spaceList(page).getByRole("alert")).toHaveCount(0);
    await nameInput(page).press("Enter");
    await expect(spaceList(page).getByRole("alert")).toHaveText("이미 같은 이름의 공간이 있어요");
  });

  test("엣지: Esc는 입력칸만 닫고(목록은 그대로) 이름은 그대로다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await rowAction(page, "형 방", "내 방", "이름 바꾸기");
    await nameInput(page).fill("바뀌면 안 됨");
    await nameInput(page).press("Escape");
    await expect(nameInput(page)).toHaveCount(0);
    await expect(spaceItem(page, "내 방")).toBeFocused();
  });

  test("엣지: 키보드만으로 ⋯ → 이름 바꾸기 → 저장", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await pill(page, "형 방").focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab"); // 형 방 줄의 ⋯
    await expect(moreButton(page, "형 방")).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // 이름 바꾸기
    await expect(nameInput(page)).toBeFocused();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("작업실");
    await page.keyboard.press("Enter");
    await expect(spaceItem(page, "작업실")).toBeFocused();
  });
});

test.describe("공간 삭제", () => {
  test.beforeEach(async ({ page }) => {
    await twoSpaces(page);
  });

  test("지금 공간을 지우면 확인한 뒤 옆 공간으로 바뀌고 목록이 닫힌다", async ({ page }) => {
    await rowAction(page, "형 방", "형 방", "삭제");
    await expect(confirm(page)).toHaveAccessibleName("'형 방'을 지울까요?");
    await expect(confirm(page)).toHaveAccessibleDescription(
      "벽·가구·물건이 모두 사라지고 되돌릴 수 없어요.",
    );
    await expect(confirm(page).getByRole("button", { name: "취소" })).toBeFocused();
    await confirm(page).getByRole("button", { name: "지우기" }).click();
    await expect(spaceList(page)).toHaveCount(0);
    await expect(pill(page, "내 방")).toBeVisible();
    await pill(page, "내 방").click();
    await expect(spaceList(page).getByRole("listitem")).toHaveCount(1);
  });

  test("엣지: 지금 공간이 아닌 공간을 지우면 지금 공간은 그대로다", async ({ page }) => {
    await rowAction(page, "형 방", "내 방", "삭제");
    await confirm(page).getByRole("button", { name: "지우기" }).click();
    await expect(pill(page, "형 방")).toBeVisible();
  });

  test("엣지: 확인에서 취소·Esc·바깥 누르기는 지우지 않고 목록도 그대로다", async ({
    page,
    isMobile,
  }) => {
    await rowAction(page, "형 방", "형 방", "삭제");
    await confirm(page).getByRole("button", { name: "취소" }).click();
    await expect(confirm(page)).toHaveCount(0);
    await expect(spaceList(page).getByRole("button", { name: "삭제", exact: true })).toBeFocused();
    if (!isMobile) {
      await page.keyboard.press("Enter"); // 삭제 다시
      await page.keyboard.press("Escape");
      await expect(confirm(page)).toHaveCount(0);
      await expect(spaceList(page)).toBeVisible();
    }
    await spaceList(page).getByRole("button", { name: "삭제", exact: true }).click();
    await page.mouse.click(5, 5); // 대화상자 바깥
    await expect(confirm(page)).toHaveCount(0);
    await expect(spaceList(page).getByRole("listitem")).toHaveCount(2);
  });

  test("엣지: 마지막 공간까지 지우면 첫 실행 화면이 나온다", async ({ page }) => {
    await rowAction(page, "형 방", "형 방", "삭제");
    await confirm(page).getByRole("button", { name: "지우기" }).click();
    await rowAction(page, "내 방", "내 방", "삭제");
    await confirm(page).getByRole("button", { name: "지우기" }).click();
    await expect(page.getByRole("button", { name: "벽 그리러 가기" })).toBeVisible();
    await expect(page.getByLabel("공간 이름")).toHaveValue("내 방");
  });

  test("엣지: 숫자로 끝나는 이름은 읽는 소리로 조사를 고른다 ('새 공간 2'를)", async ({ page }) => {
    await addSpaceFromList(page, "새 공간 2", "형 방");
    await finishEditing(page);
    await rowAction(page, "새 공간 2", "새 공간 2", "삭제");
    await expect(confirm(page)).toHaveAccessibleName("'새 공간 2'를 지울까요?");
  });

  test("엣지: 360px에서도 버튼·확인 대화상자가 화면 안이다", async ({ page }, testInfo) => {
    const width = page.viewportSize()?.width ?? 0;
    await pill(page, "형 방").click();
    await moreButton(page, "형 방").click();
    const remove = await spaceList(page)
      .getByRole("button", { name: "삭제", exact: true })
      .boundingBox();
    expect((remove?.x ?? 0) + (remove?.width ?? 0)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath("space-actions.png"), fullPage: true });
    await spaceList(page).getByRole("button", { name: "삭제", exact: true }).click();
    const dialog = await confirm(page).boundingBox();
    expect(dialog?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((dialog?.x ?? 0) + (dialog?.width ?? 0)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath("space-remove.png"), fullPage: true });
  });
});
