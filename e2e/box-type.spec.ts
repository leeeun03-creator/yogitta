import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, plan, pressCm } from "./helpers";
import { FLOOR, boxButton, nameField, panel, placeBox, typeButton } from "./boxes";

const typeButtons = (page: Page) =>
  panel(page).getByRole("group", { name: "종류" }).getByRole("button");
const firstBox = (page: Page) => plan(page).getByTestId("box").first();
const body = (page: Page) => firstBox(page).locator("rect").first(); // 몸통 (침대는 머리판 띠가 뒤에 있다)
const undo = (page: Page) => page.getByRole("button", { name: "되돌리기" }).click();
/**
 * 고른 가구를 푼다 (다른 도구를 골랐다가 선택 도구로). 고른 가구는 늘 강조색 실선이라 풀어야 보통 테두리가 보인다.
 * 빈 곳을 누르면 구역 이름 입력칸이 떠서 휴대폰에서는 가구를 가리므로 도구로 푼다.
 */
async function deselect(page: Page) {
  await chooseTool(page, "직선");
  await chooseTool(page, "선택");
}

/** 머리판 띠 가운데가 몸통 안에서 어디쯤인지 (0 ~ 1, 왼쪽·위가 0). */
async function headboardAt(page: Page) {
  const empty = { x: 0, y: 0, width: 1, height: 1 };
  const band = (await firstBox(page).getByTestId("bed-headboard").boundingBox()) ?? empty;
  const rect = (await body(page).boundingBox()) ?? empty;
  return {
    x: (band.x + band.width / 2 - rect.x) / rect.width,
    y: (band.y + band.height / 2 - rect.y) / rect.height,
  };
}

test.describe("속성 패널 종류 선택으로 가구 종류 바꾸기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 200 × 150, 가운데 (200, 125)
  });

  test("종류 8개가 4열로 놓이고(휴대폰은 한 줄) 지금 종류(보관함)가 눌려 있다", async ({
    page,
    isMobile,
  }) => {
    const labels = ["양문 수납장", "서랍장", "선반", "벽걸이", "책상", "테이블", "침대", "보관함"];
    await expect(typeButtons(page)).toHaveText(labels);
    await expect(typeButton(page, "보관함")).toHaveAttribute("aria-pressed", "true");
    await expect(typeButton(page, "서랍장")).toHaveAttribute("aria-pressed", "false");
    const tops = await typeButtons(page).evaluateAll((buttons) =>
      buttons.map((button) => Math.round(button.getBoundingClientRect().top)),
    );
    if (isMobile) {
      expect(new Set(tops).size).toBe(1); // 한 줄
    } else {
      expect(new Set(tops.slice(0, 4)).size).toBe(1); // 첫 줄 4개
      expect(tops[4]).toBeGreaterThan(tops[0] ?? 0); // 다섯 번째부터 둘째 줄
    }
  });

  test("서랍장을 누르면 이름이 '서랍장 1'이 되고 2D 테두리가 실선이며, 되돌리면 보관함이다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await deselect(page);
    await expect(body(page)).toHaveAttribute("stroke-dasharray", /.+/); // 보관함은 점선
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], isMobile); // 다시 고른다
    await typeButton(page, "서랍장").click();
    await expect(typeButton(page, "서랍장")).toHaveAttribute("aria-pressed", "true");
    await expect(nameField(page)).toHaveValue("서랍장 1");
    await expect(boxButton(page, "서랍장 1")).toHaveCount(1);
    await expect(firstBox(page)).toHaveAttribute("data-type", "drawer");
    await deselect(page);
    await expect(body(page)).not.toHaveAttribute("stroke-dasharray", /.+/); // 서랍장은 실선
    await undo(page);
    await expect(boxButton(page, "보관함 1")).toHaveCount(1);
    await expect(body(page)).toHaveAttribute("stroke-dasharray", /.+/);
    expect(errors).toEqual([]);
  });

  test("높이가 기본 높이와 다르면 [기본 높이 …cm로]가 보이고, 누르면 그 높이가 된다", async ({
    page,
  }) => {
    const sizeText = panel(page).getByText(/^200 × 150 × \d+ cm$/);
    const typeHeight = (cm: number) =>
      panel(page).getByRole("button", { name: `기본 높이 ${cm}cm로` });
    await expect(typeHeight(40)).toBeVisible(); // 처음 놓은 가구는 90cm, 보관함 기본 높이는 40cm
    await typeButton(page, "서랍장").click();
    await expect(panel(page).getByRole("button", { name: /^기본 높이/ })).toHaveCount(0); // 90cm 그대로
    await typeButton(page, "양문 수납장").click();
    await typeHeight(180).click();
    await expect(sizeText).toHaveText("200 × 150 × 180 cm");
    await expect(panel(page).getByRole("button", { name: /^기본 높이/ })).toHaveCount(0);
    await undo(page);
    await expect(sizeText).toHaveText("200 × 150 × 90 cm");
  });

  test("엣지: 지금 종류를 다시 누르면 그대로다 (되돌리기 기록이 남지 않는다)", async ({ page }) => {
    await typeButton(page, "보관함").click();
    await expect(typeButton(page, "보관함")).toHaveAttribute("aria-pressed", "true");
    await undo(page); // 되돌리면 종류가 아니라 가구 놓기가 물려진다
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
  });

  test("엣지: 키보드만으로 종류를 바꾼다 (Enter · Space)", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await typeButton(page, "서랍장").focus();
    await page.keyboard.press("Enter");
    await expect(typeButton(page, "서랍장")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Shift+Tab");
    await expect(typeButton(page, "양문 수납장")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(nameField(page)).toHaveValue("양문 수납장 1");
  });

  test("엣지: 침대는 정면 반대쪽에 머리판 띠가 있고, 돌리면 따라 돈다", async ({ page }) => {
    await typeButton(page, "침대").click();
    await expect(firstBox(page).getByTestId("bed-headboard")).toHaveCount(1);
    expect((await headboardAt(page)).y).toBeLessThan(0.25); // 정면(아래) 반대쪽 = 위 가장자리
    await panel(page).getByRole("button", { name: "90° 회전" }).click();
    // 시계 방향 90도: 정면은 왼쪽, 머리판은 오른쪽 가장자리
    expect((await headboardAt(page)).x).toBeGreaterThan(0.75);
    await typeButton(page, "책상").click();
    await expect(firstBox(page).getByTestId("bed-headboard")).toHaveCount(0);
  });

  test("엣지: 길어진 이름(양문 수납장 1)도 2D 가구 안에 들어간다", async ({ page, isMobile }) => {
    // 휴대폰은 작은 가구 이름을 숨겨서(12px 미만, T6-2) 넓은 가구로 본다
    await placeBox(page, { x: 50, y: 250 }, { x: 550, y: 400 }, isMobile); // 500 × 150
    await typeButton(page, "양문 수납장").click();
    const label = await plan(page).getByText("양문 수납장 1").boundingBox();
    const rect = await plan(page).getByTestId("box").nth(1).locator("rect").first().boundingBox();
    expect(label).not.toBeNull();
    expect(label?.x ?? 0).toBeGreaterThanOrEqual(rect?.x ?? Infinity);
    expect((label?.x ?? 0) + (label?.width ?? 0)).toBeLessThanOrEqual(
      (rect?.x ?? 0) + (rect?.width ?? 0),
    );
  });

  test("엣지: 360px에서는 종류를 한 줄로 넘겨 보고, 지금 종류가 화면 안이며 버튼이 44px 이상이다", async ({
    page,
    isMobile,
  }, testInfo) => {
    test.skip(!isMobile, "휴대폰 화면에서만");
    const width = page.viewportSize()?.width ?? 0;
    const isOnScreen = async (name: string) => {
      const box = await typeButton(page, name).boundingBox();
      return (box?.x ?? -1) >= 0 && (box?.x ?? 0) + (box?.width ?? 0) <= width;
    };
    expect(await isOnScreen("보관함")).toBe(true); // 맨 끝이라도 지금 종류는 보이게 넘겨 둔다
    for (const button of await typeButtons(page).all()) {
      expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(width); // 화면 전체가 옆으로 밀리지 않는다
    const panelOverflow = await panel(page).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(panelOverflow).toBeLessThanOrEqual(0); // 넘기는 것은 종류 줄만, 패널 전체는 옆으로 안 밀린다
    await typeButton(page, "서랍장").click();
    await expect(typeButton(page, "서랍장")).toHaveAttribute("aria-pressed", "true");
    expect(await isOnScreen("서랍장")).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("box-type.png"), fullPage: true });
  });

  test("스크린샷을 남긴다 (시안 04·08과 비교)", async ({ page, isMobile }, testInfo) => {
    test.skip(isMobile, "휴대폰은 위 테스트에서 찍는다");
    await placeBox(page, { x: 350, y: 250 }, { x: 550, y: 400 }, false);
    await typeButton(page, "침대").click();
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], false); // 보관함 1을 고른다
    await typeButton(page, "서랍장").click();
    await page.waitForTimeout(300); // 버튼 바탕색이 바뀌는 동안을 기다린다 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("box-type.png"), fullPage: true });
  });
});
