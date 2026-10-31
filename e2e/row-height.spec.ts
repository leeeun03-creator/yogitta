import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, openPreview, viewGroup } from "./helpers";
import { openDetails, panel, placeBox, sizeField, typeButton } from "./boxes";
import { savedBoxes } from "./stack";

const rowField = (page: Page, label: string) =>
  panel(page).getByRole("group", { name: "칸 높이 (cm)" }).getByRole("textbox", { name: label });
const rowError = (page: Page) => panel(page).getByText(/^칸 높이(는| 합계)/);

/** 저장된 서랍장 1의 칸 높이 (정해 둔 것이 없으면 undefined). */
const savedRows = async (page: Page) =>
  (await savedBoxes(page)).find((box) => box.name === "서랍장 1")?.rowHeights;

/** 칸 높이 입력칸에 써 넣고 Enter. */
async function setRow(page: Page, label: string, value: string) {
  await rowField(page, label).fill(value);
  await rowField(page, label).press("Enter");
}

test.describe("칸마다 높이를 넣어 3D 칸 모양 바꾸기", () => {
  // 서랍장 1: 200 × 150 × 90, 서랍 3개 (균등 분배 30 · 30 · 30)
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await openDetails(page);
    await typeButton(page, "서랍장").click();
    await expect(rowField(page, "1번째 서랍")).toHaveValue("30");
  });

  test("1번째 서랍을 20으로 바꾸면 저장되고 3D 서랍 앞판이 따라 바뀌며, 되돌리기 한 번에 돌아간다", async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await setRow(page, "1번째 서랍", "20");
    await expect.poll(() => savedRows(page)).toEqual([20, 30, 30]);
    await expect(rowField(page, "1번째 서랍")).toHaveValue("20");
    await openPreview(page);
    await page.screenshot({ path: testInfo.outputPath("rows-3d.png") });
    await viewGroup(page).getByRole("button", { name: "2D 평면도" }).click(); // 휴대폰은 3D에서 속성 패널이 숨는다
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect.poll(() => savedRows(page)).toBeUndefined();
    await expect(rowField(page, "1번째 서랍")).toHaveValue("30");
    expect(errors).toEqual([]);
  });

  test("엣지: 합이 전체 높이를 넘으면 바꾸지 않고 까닭을 띄우고, 다른 칸을 줄이면 늘릴 수 있다", async ({
    page,
  }) => {
    await setRow(page, "2번째 서랍", "40");
    await expect(rowError(page)).toHaveText(
      "칸 높이 합계가 전체 높이 90cm를 넘어요. 다른 칸을 먼저 줄여 주세요",
    );
    await expect(rowField(page, "2번째 서랍")).toHaveAttribute("aria-invalid", "true");
    expect(await savedRows(page)).toBeUndefined();
    await setRow(page, "1번째 서랍", "20");
    await setRow(page, "2번째 서랍", "40");
    await expect.poll(() => savedRows(page)).toEqual([20, 40, 30]);
    await expect(rowError(page)).toHaveCount(0);
  });

  test("엣지: 숫자가 아니거나 10cm보다 작으면 막고, Esc는 지금 높이로 되돌린다", async ({
    page,
  }) => {
    await setRow(page, "3번째 서랍", "abc");
    await expect(rowError(page)).toHaveText("칸 높이는 숫자로 써 주세요");
    await setRow(page, "3번째 서랍", "5");
    await expect(rowError(page)).toHaveText("칸 높이는 10cm보다 작게 할 수 없어요");
    await rowField(page, "3번째 서랍").press("Escape");
    await expect(rowField(page, "3번째 서랍")).toHaveValue("30");
    await expect(rowError(page)).toHaveCount(0);
    expect(await savedRows(page)).toBeUndefined();
  });

  test("엣지: 칸 수나 가구 높이를 바꾸면 칸 높이는 균등 분배로 돌아간다", async ({ page }) => {
    await setRow(page, "1번째 서랍", "20");
    await expect.poll(() => savedRows(page)).toEqual([20, 30, 30]);
    await panel(page).getByRole("button", { name: "칸 늘리기" }).click();
    await expect(rowField(page, "4번째 서랍")).toHaveValue("22.5");
    await expect(rowField(page, "1번째 서랍")).toHaveValue("22.5");
    await setRow(page, "1번째 서랍", "20");
    await sizeField(page, "높이").fill("100");
    await sizeField(page, "높이").press("Enter");
    await expect(rowField(page, "1번째 서랍")).toHaveValue("25");
  });
});

test.describe("칸 높이 합계와 칸 비율 미리보기 보여주기", () => {
  const sumLine = (page: Page) => panel(page).getByText(/^합계 /);
  const barRows = (page: Page) => panel(page).getByTestId("row-bar").locator("span");

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await openDetails(page);
    await typeButton(page, "서랍장").click();
  });

  test("합계 줄이 입력하는 대로 바뀌고(빈 자리 안내), 넘으면 경고색이 된다", async ({ page }) => {
    await expect(sumLine(page)).toHaveText("합계 90 / 전체 높이 90");
    await setRow(page, "1번째 서랍", "20");
    await expect(sumLine(page)).toHaveText("합계 80 / 전체 높이 90 · 아래 10cm는 빈 자리예요");
    await rowField(page, "2번째 서랍").fill("50"); // Enter 전에도 바로 보인다
    await expect(sumLine(page)).toHaveText("합계 100 / 전체 높이 90");
    await expect(sumLine(page)).toHaveAttribute("data-over", "true");
  });

  test("입력칸을 고르면 미리보기 막대의 그 칸이 강조되고, 빈 자리도 막대에 보인다", async ({
    page,
  }, testInfo) => {
    await setRow(page, "1번째 서랍", "20");
    await rowField(page, "2번째 서랍").focus();
    await expect(barRows(page)).toHaveCount(4); // 서랍 3 + 맨 아래 빈 자리
    await expect(barRows(page).nth(1)).toHaveAttribute("data-active", "true");
    await expect(barRows(page).locator("xpath=self::*[@data-active]")).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath("bar.png") });
  });

  test("엣지: 칸 8개여도 막대·입력칸이 화면 밖으로 넘치지 않는다 (휴대폰 360px)", async ({
    page,
  }, testInfo) => {
    const more = panel(page).getByRole("button", { name: "칸 늘리기" });
    for (let count = 3; count < 8; count++) await more.click();
    await expect(rowField(page, "8번째 서랍")).toBeVisible();
    await expect(barRows(page)).toHaveCount(8);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await rowField(page, "8번째 서랍").scrollIntoViewIfNeeded(); // 휴대폰 속성 패널은 안에서 스크롤된다
    await page.screenshot({ path: testInfo.outputPath("eight.png") });
  });
});
