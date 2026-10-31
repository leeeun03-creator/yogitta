import { expect, test, type Page } from "@playwright/test";
import { collectErrors, pressCm } from "./helpers";
import { FLOOR, panel } from "./boxes";
import { addItem, listButton } from "./items";
import { finishEditing } from "./spaces";
import { expectSaved, placeDeskAndBox, savedBoxes, stackBoxOnDesk } from "./stack";

const DESK = { x: 260, y: 200 }; // 책상 1의 빈 곳 (보관함 1은 오른쪽 (330, 205)에 올라가 있다)
const dialog = (page: Page) => page.getByRole("alertdialog", { name: "책상 1을 지울까요?" });
const stackedChoice = (page: Page, name: string) =>
  dialog(page).getByRole("group", { name: "가구 위 가구 1개" }).getByRole("button", { name });

/** 책상 1을 골라 속성 패널 [삭제]를 누른다. */
async function removeDesk(page: Page, isMobile: boolean) {
  await pressCm(page, FLOOR, [DESK], isMobile);
  await panel(page).getByRole("button", { name: "삭제" }).click();
  await expect(dialog(page)).toBeVisible();
}

const savedNames = async (page: Page) => (await savedBoxes(page)).map((box) => box.name);

test.describe("받침 가구를 지울 때 가구 위 가구를 바닥으로 내릴지 같이 지울지 묻기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await placeDeskAndBox(page, isMobile);
    await stackBoxOnDesk(page, isMobile);
  });

  test("책상을 지우면 묻고, [바닥으로 내리기](처음 고른 것)로 지우면 보관함이 바닥에 남는다", async ({
    page,
    isMobile,
  }, testInfo) => {
    const errors = collectErrors(page);
    await removeDesk(page, isMobile);
    await expect(dialog(page)).toHaveAccessibleDescription(
      "위에 올려 둔 가구가 1개 있어요. 바닥으로 내리거나 같이 지울 수 있어요",
    );
    await expect(stackedChoice(page, "바닥으로 내리기")).toHaveAttribute("aria-pressed", "true");
    await page.screenshot({ path: testInfo.outputPath("ask.png") });
    await dialog(page).getByRole("button", { name: "지우기", exact: true }).click();
    await expectSaved(page, ["보관함 1", 0, null]);
    await expect.poll(() => savedNames(page)).toEqual(["보관함 1"]);
    expect(errors).toEqual([]);
  });

  test("[위 가구도 지우기]를 고르면 보관함도 같이 지워지고, 되돌리기 한 번에 둘 다 돌아온다", async ({
    page,
    isMobile,
  }) => {
    await removeDesk(page, isMobile);
    await stackedChoice(page, "위 가구도 지우기").click();
    await dialog(page).getByRole("button", { name: "지우기", exact: true }).click();
    await expect.poll(() => savedNames(page)).toEqual([]);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expectSaved(page, ["보관함 1", 73, "책상 1"]);
  });

  test("엣지: 취소하면 그대로다", async ({ page, isMobile }) => {
    await removeDesk(page, isMobile);
    await dialog(page).getByRole("button", { name: "취소" }).click();
    await expect(dialog(page)).toBeHidden();
    await expectSaved(page, ["보관함 1", 73, "책상 1"]);
  });

  test("엣지: 물건 든 책상이면 물건 질문과 함께 나오고, 위 가구도 지우면 옮길 가구에서 빠진다", async ({
    page,
    isMobile,
  }) => {
    await finishEditing(page);
    await listButton(page, "책상 1").click();
    await addItem(page, { name: "공책" });
    await page.getByRole("button", { name: "편집" }).click();
    await removeDesk(page, isMobile);
    await expect(dialog(page)).toHaveAccessibleDescription(
      "위에 올려 둔 가구가 1개 있어요. 물건 1개가 들어 있어요. 다른 가구의 칸 없음으로 옮기거나 같이 지울 수 있어요",
    );
    await stackedChoice(page, "위 가구도 지우기").click();
    await expect(dialog(page).getByRole("button", { name: "옮기고 지우기" })).toHaveCount(0);
    await stackedChoice(page, "바닥으로 내리기").click();
    await dialog(page).getByRole("button", { name: "옮기고 지우기" }).click(); // 보관함 1로
    await expectSaved(page, ["보관함 1", 0, null]);
    await finishEditing(page);
    await expect(listButton(page, "보관함 1")).toHaveAccessibleName("보관함 1 물건 1개");
  });
});
