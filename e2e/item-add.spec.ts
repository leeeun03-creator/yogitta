import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { openDetails, placeBox, typeButton } from "./boxes";
import { finishEditing } from "./spaces";

const detail = (page: Page) => page.getByRole("complementary", { name: "가구 상세 패널" });
const form = (page: Page) => detail(page).getByRole("form", { name: "물건 넣기" });
const row = (page: Page, label: string) =>
  detail(page)
    .getByRole("list", { name: "칸별 물건" })
    .locator(":scope > li")
    .filter({ hasText: label });
const chips = (page: Page, label: string) =>
  detail(page)
    .getByRole("list", { name: `${label} 물건` })
    .getByRole("button");

type NewItem = { name: string; slot?: string; memo?: string };

/** [+ 물건 넣기]로 물건 하나를 넣는다 (slot은 칸 이름, 안 주면 열린 채의 칸). */
async function addItem(page: Page, item: NewItem, opener?: () => Promise<void>) {
  if (opener) await opener();
  else await detail(page).getByRole("button", { name: "물건 넣기" }).click();
  await form(page).getByLabel("물건 이름").fill(item.name);
  if (item.slot) await form(page).getByLabel("칸").selectOption({ label: item.slot });
  if (item.memo) await form(page).getByLabel("메모 (선택)").fill(item.memo);
  await form(page).getByRole("button", { name: "넣기" }).click();
}

test.describe("가구 상세 패널에서 칸에 물건 넣고 빼기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await openDetails(page);
    await typeButton(page, "서랍장").click(); // 1 ~ 3번째 서랍
    await finishEditing(page);
    await detail(page)
      .getByRole("button", { name: /^서랍장 1 물건/ })
      .click();
  });

  test("이름·칸·메모를 넣으면 그 칸에 칩이 생기고, 칩을 눌러 메모를 보고 [빼기]로 뺀다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await addItem(page, { name: "여권", slot: "2번째 서랍", memo: "파란 파우치 안" });
    await expect(form(page)).toHaveCount(0);
    await expect(chips(page, "2번째 서랍")).toHaveText(["여권"]);
    await expect(detail(page)).toContainText("구역 없음 · 물건 1개");
    await chips(page, "2번째 서랍").first().click();
    const bar = detail(page).getByRole("region", { name: "여권 물건" });
    await expect(bar).toContainText("여권 · 2번째 서랍");
    await expect(bar).toContainText("파란 파우치 안");
    await bar.getByRole("button", { name: "빼기" }).click();
    await expect(row(page, "2번째 서랍")).toContainText("비어 있어요");
    await expect(detail(page)).toContainText("물건 0개");
    expect(errors).toEqual([]);
  });

  test("칸을 안 고르면 칸 없음 행에 들어가고, 가구 목록의 물건 수가 따라 바뀐다", async ({
    page,
  }) => {
    await addItem(page, { name: "선글라스", slot: "칸 없음" });
    await expect(chips(page, "칸 없음")).toHaveText(["선글라스"]);
    await detail(page).getByRole("button", { name: "닫기" }).click();
    await expect(detail(page).getByRole("button", { name: "서랍장 1 물건 1개" })).toBeVisible();
  });

  test("빈 칸의 [+ 추가]는 그 칸이 골라진 채 열린다", async ({ page }) => {
    await addItem(page, { name: "양말" }, () =>
      detail(page).getByRole("button", { name: "3번째 서랍에 물건 추가" }).click(),
    );
    await expect(chips(page, "3번째 서랍")).toHaveText(["양말"]);
  });

  test("엣지: 빈 이름·31자는 막고 까닭이 뜬다, 30자는 된다", async ({ page }) => {
    await detail(page).getByRole("button", { name: "물건 넣기" }).click();
    const name = form(page).getByLabel("물건 이름");
    await form(page).getByRole("button", { name: "넣기" }).click();
    await expect(name).toHaveAccessibleDescription("물건 이름을 써 주세요");
    await name.fill("가".repeat(31));
    await form(page).getByRole("button", { name: "넣기" }).click();
    await expect(name).toHaveAccessibleDescription("물건 이름은 30자까지 쓸 수 있어요");
    await name.fill("가".repeat(30));
    await form(page).getByRole("button", { name: "넣기" }).click();
    await expect(form(page)).toHaveCount(0);
  });

  test("엣지: 같은 칸에 같은 이름 둘·많은 물건도 들어가고 줄을 바꿔 보인다", async ({ page }) => {
    const names = ["충전기", "충전기", "보조배터리", "이어폰", "케이블", "멀티탭"];
    for (const name of names) await addItem(page, { name, slot: "1번째 서랍" });
    await expect(chips(page, "1번째 서랍")).toHaveText(names);
    const rowBox = await row(page, "1번째 서랍").boundingBox();
    expect(rowBox?.height ?? 0).toBeGreaterThan(60); // 한 줄(약 50px)을 넘어 줄을 바꿨다
  });

  test("엣지: 입력 중 Esc는 입력만 닫고 가구 상세 패널은 그대로다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await detail(page).getByRole("button", { name: "물건 넣기" }).click();
    await form(page).getByLabel("물건 이름").fill("모자");
    await page.keyboard.press("Escape");
    await expect(form(page)).toHaveCount(0);
    await expect(detail(page).getByRole("heading", { name: "서랍장 1" })).toBeVisible();
    await expect(row(page, "1번째 서랍")).toContainText("비어 있어요");
  });

  test("엣지: 키보드만으로 넣는다 (Enter로 열고 Enter로 넣기)", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await detail(page).getByRole("button", { name: "물건 넣기" }).focus();
    await page.keyboard.press("Enter");
    await expect(form(page).getByLabel("물건 이름")).toBeFocused();
    await page.keyboard.type("우산");
    await page.keyboard.press("Enter");
    await expect(chips(page, "칸 없음")).toHaveText(["우산"]); // 칸을 안 골랐다
  });

  test("스크린샷을 남긴다 (시안 01·08과 비교)", async ({ page }, testInfo) => {
    await addItem(page, { name: "여권", slot: "2번째 서랍", memo: "파란 파우치 안" });
    await addItem(page, { name: "보조배터리", slot: "2번째 서랍" });
    await addItem(page, { name: "선글라스", slot: "칸 없음" });
    await chips(page, "2번째 서랍").first().click();
    await detail(page).getByRole("button", { name: "물건 넣기" }).click();
    await page.screenshot({ path: testInfo.outputPath("item-add.png"), fullPage: true });
  });
});
