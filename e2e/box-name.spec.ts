import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, plan, pressCm } from "./helpers";
import { FLOOR, boxButton, nameField, placeBox } from "./boxes";

const pill = (page: Page) => page.getByTestId("selected-box-label");
const undo = (page: Page) => page.getByRole("button", { name: "되돌리기" }).click();

/** 이름 입력칸에 써 넣고 Enter. */
async function rename(page: Page, name: string) {
  await nameField(page).fill(name);
  await nameField(page).press("Enter");
}

test.describe("속성 패널에서 가구 이름 바꾸기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 보관함 1, 가운데 (200, 125)
    await placeBox(page, { x: 350, y: 50 }, { x: 550, y: 200 }, isMobile); // 보관함 2 (골라짐)
  });

  test("Enter면 저장되고 가구 버튼·이름 알약이 따라 바뀌며, 되돌리면 원래 이름이다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await expect(nameField(page)).toHaveValue("보관함 2");
    await rename(page, "화장대 서랍장");
    await expect(boxButton(page, "화장대 서랍장")).toHaveCount(1);
    await expect(pill(page)).toHaveText("화장대 서랍장");
    if (!isMobile) await expect(plan(page).getByText("화장대 서랍장")).toBeVisible(); // 2D 이름 라벨
    await undo(page);
    await expect(nameField(page)).toHaveValue("보관함 2");
    await expect(boxButton(page, "보관함 2")).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("같은 공간의 같은 이름(띄어쓰기만 달라도)은 저장되지 않고 안내가 뜨며, Esc면 원래 이름이다", async ({
    page,
  }) => {
    await rename(page, "보관함1");
    await expect(nameField(page)).toHaveAccessibleDescription("이미 '보관함1'이 있어요");
    await expect(nameField(page)).toHaveAttribute("aria-invalid", "true");
    await expect(boxButton(page, "보관함 2")).toHaveCount(1); // 그대로
    await nameField(page).press("Escape");
    await expect(nameField(page)).toHaveValue("보관함 2");
    await expect(nameField(page)).toHaveAccessibleDescription("");
  });

  test("엣지: 빈 이름·공백만·15자를 넘는 이름은 막는다", async ({ page }) => {
    await rename(page, "   ");
    await expect(nameField(page)).toHaveAccessibleDescription("가구 이름을 써 주세요");
    await rename(page, "가".repeat(16));
    await expect(nameField(page)).toHaveAccessibleDescription("가구 이름은 15자까지 쓸 수 있어요");
    await rename(page, "가".repeat(15));
    await expect(boxButton(page, "가".repeat(15))).toHaveCount(1);
  });

  test("엣지: 앞뒤 공백은 지우고, 이모지도 된다", async ({ page }) => {
    await rename(page, "  📦 수납 ");
    await expect(boxButton(page, "📦 수납")).toHaveCount(1);
    await expect(nameField(page)).toHaveValue("📦 수납");
  });

  test("엣지: 자기 이름 그대로면 되돌리기 기록이 남지 않는다", async ({ page }) => {
    await rename(page, " 보관함 2 ");
    await expect(nameField(page)).toHaveValue("보관함 2");
    await undo(page); // 되돌리면 이름이 아니라 보관함 2 놓기가 물려진다
    await expect(plan(page)).toHaveAccessibleName(/가구 1개$/);
  });

  test("엣지: 입력칸을 벗어나면 저장되고, 쓰는 중에 다른 가구를 고르면 쓰던 이름이 저장된 뒤 그 가구가 보인다", async ({
    page,
    isMobile,
  }) => {
    await nameField(page).fill("화장대");
    await nameField(page).blur();
    await expect(boxButton(page, "화장대")).toHaveCount(1);
    await nameField(page).fill("작은 화장대");
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], isMobile); // 보관함 1을 누른다
    await expect(nameField(page)).toHaveValue("보관함 1");
    await expect(boxButton(page, "작은 화장대")).toHaveCount(1);
  });

  test("엣지: 이름을 쓰는 중에 R·Delete를 눌러도 가구가 돌거나 지워지지 않는다", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await nameField(page).click();
    await page.keyboard.press("End");
    await page.keyboard.type("R");
    await page.keyboard.press("Delete");
    await page.keyboard.press("Enter");
    await expect(boxButton(page, "보관함 2R")).toHaveCount(1);
    await expect(plan(page)).toHaveAccessibleName(/가구 2개$/);
    const data = await plan(page).getByTestId("box").nth(1).getAttribute("data-box");
    expect(data?.split(",")[4]).toBe("0"); // 돌지 않았다
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page }, testInfo) => {
    await rename(page, "보관함 1");
    await page.screenshot({ path: testInfo.outputPath("box-name.png"), fullPage: true });
  });
});
