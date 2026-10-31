import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, openPreview, pressCm } from "./helpers";
import { FLOOR, detailsToggle, openDetails, panel, placeBox, typeButton } from "./boxes";
import { savedBoxes } from "./stack";

const elevationField = (page: Page) => panel(page).getByRole("textbox", { name: "설치 높이 (cm)" });
const elevationError = (page: Page) => panel(page).getByText(/^설치 높이(는|와)|^아래나 위 가구/);
const savedElevation = async (page: Page) =>
  (await savedBoxes(page)).find((box) => box.name === "벽걸이 1")?.elevation;

/** 설치 높이 입력칸에 써 넣고 Enter. */
async function setElevation(page: Page, value: string) {
  await elevationField(page).fill(value);
  await elevationField(page).press("Enter");
}

/** 휴대폰에서 펼친 종류·크기를 접는다 (2D 평면도를 덜 가리게). 데스크톱은 아무것도 하지 않는다. */
async function closeDetails(page: Page) {
  const toggle = detailsToggle(page);
  if (!(await toggle.isVisible())) return;
  if ((await toggle.getAttribute("aria-expanded")) === "true") await toggle.click();
}

test.describe("벽걸이 설치 높이 넣기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  // 벽걸이 1: 가운데 (130, 70), 60 × 40 × 90, 설치 높이 150 (150 + 90 = 240)
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 160, y: 90 }, isMobile);
    await openDetails(page);
    await typeButton(page, "벽걸이").click();
    await expect(elevationField(page)).toHaveValue("150");
  });

  test("설치 높이를 120으로 바꾸면 저장되고 3D에서 그 높이에 뜬다", async ({ page }, testInfo) => {
    const errors = collectErrors(page);
    await setElevation(page, "120");
    await expect.poll(() => savedElevation(page)).toBe(120);
    await openPreview(page);
    await page.screenshot({ path: testInfo.outputPath("elevation-3d.png") });
    expect(errors).toEqual([]);
  });

  test("엣지: 숫자가 아니거나, 바닥보다 낮거나, 설치 높이 + 높이가 240cm를 넘으면 막는다", async ({
    page,
  }) => {
    await setElevation(page, "abc");
    await expect(elevationError(page)).toHaveText("설치 높이는 숫자로 써 주세요");
    await setElevation(page, "-10");
    await expect(elevationError(page)).toHaveText("설치 높이는 0cm보다 낮게 할 수 없어요");
    await setElevation(page, "160");
    await expect(elevationError(page)).toHaveText("설치 높이와 가구 높이를 더해 240cm까지예요");
    await elevationField(page).press("Escape");
    await expect(elevationField(page)).toHaveValue("150");
    expect(await savedElevation(page)).toBe(150);
  });

  test("엣지: 아래에 놓은 가구와 높이가 겹치면 막고, 맞닿는 높이는 된다", async ({
    page,
    isMobile,
  }) => {
    await closeDetails(page);
    await placeBox(page, { x: 100, y: 50 }, { x: 160, y: 90 }, isMobile); // 벽걸이 아래 보관함 1 (높이 90)
    await pressCm(page, FLOOR, [{ x: 130, y: 70 }], isMobile); // 위에 보이는 벽걸이가 골라진다
    await openDetails(page);
    await setElevation(page, "60");
    await expect(elevationError(page)).toHaveText(
      "아래나 위 가구와 높이가 겹쳐서 이 높이로 바꿀 수 없어요",
    );
    await setElevation(page, "90");
    await expect.poll(() => savedElevation(page)).toBe(90);
  });
});
