import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";

const SEARCH_MAX_PX = 640; // 검색창 최대 폭 (yogitta-design 4장)
const SEARCH_HEIGHT_PX = 56;
const TOUCH_PX = 44;
const PILL_GAP_MAX_PX = 14; // 공간 알약 ~ [편집] 사이 = 머리 간격
const LONG_QUERY = "여권".repeat(100);

const searchBox = (page: Page) => page.getByRole("searchbox", { name: "물건 검색" });
const clearButton = (page: Page) => page.getByRole("button", { name: "검색어 지우기" });
const editButton = (page: Page) => page.getByRole("button", { name: "편집" });
const mainTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "요깃따" });

/** 새 공간을 만들고 [‹ 완료]로 메인 화면에 온다. */
async function openMain(page: Page) {
  await createSpace(page, { width: "6.0", depth: "4.5" });
  await page.getByRole("button", { name: "완료" }).click();
  await expect(mainTitle(page)).toBeVisible();
}
/** 가로 스크롤이 없는지. */
async function expectNoSideScroll(page: Page) {
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

test.describe("메인 화면 검색창", () => {
  test.beforeEach(async ({ page }) => {
    await openMain(page);
  });

  test("라벨 '물건 검색'으로 찾고 글자를 쓸 수 있으며, 지우기 버튼으로 비운다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await expect(searchBox(page)).toHaveAttribute("placeholder", "무엇을 찾고 있나요?");
    await expect(clearButton(page)).toHaveCount(0);
    await searchBox(page).fill("여권");
    await expect(searchBox(page)).toHaveValue("여권");
    await clearButton(page).click();
    await expect(searchBox(page)).toHaveValue("");
    await expect(searchBox(page)).toBeFocused();
    await expect(clearButton(page)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("머리 아래 가운데에 높이 56px, 폭은 640px까지다", async ({ page }) => {
    const bar = await page.getByRole("search").boundingBox();
    const header = await page.getByRole("banner").boundingBox();
    const viewport = page.viewportSize()?.width ?? 0;
    expect(bar?.height).toBeGreaterThanOrEqual(SEARCH_HEIGHT_PX);
    expect(bar?.width).toBeLessThanOrEqual(SEARCH_MAX_PX);
    expect(bar?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0));
    const left = bar?.x ?? 0;
    const right = viewport - left - (bar?.width ?? 0);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1); // 가운데
  });

  test("엣지: Enter를 눌러도 페이지가 다시 열리지 않고 글자가 남는다", async ({ page }) => {
    await searchBox(page).fill("충전기");
    await searchBox(page).press("Enter");
    await expect(mainTitle(page)).toBeVisible();
    await expect(searchBox(page)).toHaveValue("충전기");
  });

  test("엣지: 아주 긴 검색어도 검색창 폭이 그대로이고 가로 스크롤이 없다", async ({ page }) => {
    const before = await page.getByRole("search").boundingBox();
    await searchBox(page).fill(LONG_QUERY);
    const after = await page.getByRole("search").boundingBox();
    expect(after?.width).toBe(before?.width);
    await expect(clearButton(page)).toBeVisible();
    await expectNoSideScroll(page);
  });

  test("엣지: 키보드만으로 공간 알약 → [편집] → 검색창 → 지우기", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await expect(mainTitle(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "공간 내 방" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(editButton(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(searchBox(page)).toBeFocused();
    await page.keyboard.type("여권");
    await page.keyboard.press("Tab");
    await expect(clearButton(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(searchBox(page)).toHaveValue("");
  });
});

test.describe("휴대폰 메인 화면 (시안 02)", () => {
  test.skip(({ isMobile }) => !isMobile, "360px 화면에서만");

  test.beforeEach(async ({ page }) => {
    await openMain(page);
  });

  test("머리 → 검색창 → 3D 공간 순서이고, [편집]은 44px 아이콘 버튼이다", async ({ page }) => {
    const header = await page.getByRole("banner").boundingBox();
    const bar = await page.getByRole("search").boundingBox();
    const scene = await page.getByRole("region", { name: "3D 공간 영역" }).boundingBox();
    expect(bar?.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0));
    expect(scene?.y).toBeGreaterThanOrEqual((bar?.y ?? 0) + (bar?.height ?? 0));
    const edit = await editButton(page).boundingBox();
    expect(edit?.width).toBe(TOUCH_PX);
    expect(edit?.height).toBe(TOUCH_PX);
    // 공간 알약은 [편집] 바로 옆 오른쪽에 모인다 (사이는 머리 간격만)
    const pill = await page.getByRole("button", { name: "공간 내 방" }).boundingBox();
    expect((edit?.x ?? 0) - ((pill?.x ?? 0) + (pill?.width ?? 0))).toBeLessThanOrEqual(
      PILL_GAP_MAX_PX,
    );
    expect(bar?.height).toBeGreaterThanOrEqual(TOUCH_PX);
    await expectNoSideScroll(page);
  });

  test("엣지: 공간 이름 '내 방'이 잘리지 않고 다 보인다 ('공간' 글자는 화면에서 숨김)", async ({
    page,
  }) => {
    const name = page.getByRole("banner").getByText("내 방", { exact: true });
    const isCut = await name.evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(isCut).toBe(false);
    const label = await page.getByRole("banner").getByText("공간", { exact: true }).boundingBox();
    expect(label?.width ?? 0).toBeLessThanOrEqual(1);
  });
});

test("스크린샷을 남긴다 (시안 01·02와 비교)", async ({ page }, testInfo) => {
  await openMain(page);
  await searchBox(page).fill("여권");
  await page.waitForTimeout(500); // 첫 장면이 그려질 때까지 (스크린샷용)
  await page.screenshot({ path: testInfo.outputPath("main-search.png"), fullPage: true });
});
