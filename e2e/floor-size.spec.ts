import { expect, test, type Page } from "@playwright/test";

const ERROR_BG = "rgb(251, 234, 229)"; // --yg-danger-hover #FBEAE5 (시안 06 오류 바탕)

function floorCard(page: Page) {
  return page.getByRole("region", { name: "바닥 크기를 정해요" });
}
function submitButton(page: Page) {
  return page.getByRole("button", { name: "벽 그리러 가기" });
}

test.describe("바닥 크기 카드", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("첫 실행 카드와 함께 처음부터 보인다 (넓으면 옆, 좁으면 아래)", async ({
    page,
    isMobile,
  }) => {
    const emptyBox = await page.getByRole("region", { name: "아직 공간이 없어요" }).boundingBox();
    const floorBox = await floorCard(page).boundingBox();
    expect(emptyBox && floorBox).toBeTruthy();
    if (!emptyBox || !floorBox) return;
    if (isMobile) expect(floorBox.y).toBeGreaterThanOrEqual(emptyBox.y + emptyBox.height);
    else expect(floorBox.x).toBeGreaterThanOrEqual(emptyBox.x + emptyBox.width);
  });

  test("새 공간 만들기 버튼과 점선 +를 누르면 공간 이름 칸으로 간다", async ({ page }) => {
    const nameInput = page.getByLabel("공간 이름");
    for (const button of await page.getByRole("button", { name: "새 공간 만들기" }).all()) {
      await page.locator("body").focus();
      await button.click();
      await expect(nameInput).toBeFocused();
      await expect(nameInput).toBeInViewport();
    }
  });

  test("기본값은 내 방 · 원룸 6.0 × 4.5 이다", async ({ page }) => {
    await expect(page.getByLabel("공간 이름")).toHaveValue("내 방");
    await expect(page.getByLabel("가로 (m)")).toHaveValue("6.0");
    await expect(page.getByLabel("세로 (m)")).toHaveValue("4.5");
    await expect(page.getByRole("button", { name: "원룸 6×4.5" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(submitButton(page)).toBeEnabled();
  });

  test("빠른 선택 투룸을 누르면 9.0 × 6.0이 들어간다", async ({ page }) => {
    await page.getByRole("button", { name: "투룸 9×6" }).click();
    await expect(page.getByLabel("가로 (m)")).toHaveValue("9.0");
    await expect(page.getByLabel("세로 (m)")).toHaveValue("6.0");
    await expect(page.getByRole("button", { name: "투룸 9×6" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: "원룸 6×4.5" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  const BAD_SIZES = [
    ["", "크기를 적어 주세요"],
    ["abc", "숫자로 적어 주세요 (예: 6.0)"],
    ["0", "1m 이상으로 적어 주세요"],
    ["-3", "1m 이상으로 적어 주세요"],
    ["0.99", "1m 이상으로 적어 주세요"],
    ["30.01", "30m 이하로 적어 주세요"],
  ] as const;
  for (const [value, message] of BAD_SIZES) {
    test(`가로에 '${value}'를 넣으면 버튼이 막히고 안내가 나온다`, async ({ page }) => {
      const width = page.getByLabel("가로 (m)");
      await width.fill(value);
      await expect(submitButton(page)).toBeDisabled();
      await expect(width).toHaveAttribute("aria-invalid", "true");
      await expect(width).toHaveAccessibleDescription(message);
      await page.getByLabel("공간 이름").focus(); // 포커스를 빼서 오류 바탕을 본다
      await expect(width).toHaveCSS("background-color", ERROR_BG);
    });
  }

  test("공간 이름이 비면 버튼이 막힌다", async ({ page }) => {
    const name = page.getByLabel("공간 이름");
    await name.fill("   ");
    await expect(submitButton(page)).toBeDisabled();
    await expect(name).toHaveAccessibleDescription("공간 이름을 적어 주세요");
  });

  test("쉼표 소수(4,5)도 받아들인다", async ({ page }) => {
    await page.getByLabel("세로 (m)").fill("4,5");
    await expect(submitButton(page)).toBeEnabled();
  });

  test("벽 그리러 가기를 누르면 공간이 만들어지고 편집 모드로 바뀐다", async ({ page }) => {
    await page.getByLabel("공간 이름").fill("형 방");
    await page.getByRole("button", { name: "투룸 9×6" }).click();
    await submitButton(page).click();
    await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "아직 공간이 없어요" })).toHaveCount(0);
  });

  test("입력칸에서 Enter를 눌러도 만들어진다", async ({ page }) => {
    await page.getByLabel("가로 (m)").press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
  });

  test("잘못된 값에서 Enter를 누르면 만들어지지 않는다", async ({ page }) => {
    const width = page.getByLabel("가로 (m)");
    await width.fill("0");
    await width.press("Enter");
    await expect(page.getByRole("heading", { name: "아직 공간이 없어요" })).toBeVisible();
  });

  test("카드가 화면 폭 안에 들어간다", async ({ page }) => {
    const box = await floorCard(page).boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
  });

  test("스크린샷을 남긴다 (시안 03과 비교)", async ({ page }, testInfo) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath("first-run.png"), fullPage: true });
  });
});
