import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  collectErrors,
  createSpace,
  openPreview,
  plan,
  pressCm,
  viewGroup,
} from "./helpers";
import { dragCm, nameInput } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const editTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "편집 모드" });
const mainTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "요깃따" });
const doneButton = (page: Page) => page.getByRole("button", { name: "완료" });
const editButton = (page: Page) => page.getByRole("button", { name: "편집" });

/** 직선 도구로 벽 하나를 긋고 선택 도구로 돌아온다. */
async function drawWall(page: Page, isMobile: boolean) {
  await chooseTool(page, "직선");
  await pressCm(
    page,
    FLOOR,
    [
      { x: 100, y: 100 },
      { x: 500, y: 100 },
    ],
    isMobile,
  );
  await expect(plan(page)).toHaveAccessibleName(/벽 1개/);
}

/** [‹ 완료]로 메인 화면에 갔다가 [편집]으로 돌아온다. */
async function roundTrip(page: Page) {
  await doneButton(page).click();
  await expect(mainTitle(page)).toBeVisible();
  await editButton(page).click();
  await expect(editTitle(page)).toBeVisible();
}

/** 편집 모드 상단 바 높이 (px). */
const topBarHeight = async (page: Page) =>
  (await page.getByRole("banner").boundingBox())?.height ?? 0;

test.describe("편집 모드 상단 바의 [‹ 완료]", () => {
  test("엣지: 글꼴을 못 받아도 상단 바 높이가 같다 (2D 평면도가 밀리지 않게)", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await page.evaluate(() => document.fonts.ready);
    const withFonts = await topBarHeight(page);
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await createSpace(page, { width: "6.0", depth: "4.5" });
    expect(await topBarHeight(page)).toBe(withFonts);
  });

  test("엣지: 공간 이름이 길어도 상단 바가 넘치지 않고 높이가 같다", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    const short = await topBarHeight(page);
    await page.goto("./");
    await page.getByLabel("공간 이름").fill("아주아주긴공간이름입니다");
    await page.getByLabel("가로 (m)").fill("6.0");
    await page.getByLabel("세로 (m)").fill("4.5");
    await page.getByRole("button", { name: "벽 그리러 가기" }).click();
    await expect(page.getByText(/아주아주/)).toBeVisible();
    expect(await topBarHeight(page)).toBe(short);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
});

test.describe("편집 모드 ↔ 메인 화면", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("새 공간은 편집 모드로 열리고, 완료하면 메인 화면, 편집하면 그린 벽 그대로 돌아온다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await drawWall(page, isMobile);
    await doneButton(page).click();
    await expect(mainTitle(page)).toBeVisible();
    await expect(editTitle(page)).toHaveCount(0);
    await expect(plan(page)).toHaveCount(0);
    await editButton(page).click();
    await expect(editTitle(page)).toBeVisible();
    await expect(plan(page)).toHaveAccessibleName(/벽 1개/);
    expect(errors).toEqual([]);
  });

  test("엣지: 지우개·3D 미리보기로 두고 나갔다 오면 선택 도구·2D 평면도로 시작한다", async ({
    page,
  }) => {
    await chooseTool(page, "지우개");
    await openPreview(page);
    await roundTrip(page);
    await expect(viewGroup(page).getByRole("button", { name: "2D 평면도" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: "선택", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("엣지: 이름 입력칸이 열린 채 나갔다 오면 입력칸은 닫혀 있다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [{ x: 300, y: 200 }], isMobile);
    await expect(nameInput(page)).toBeVisible();
    await roundTrip(page);
    await expect(nameInput(page)).toHaveCount(0);
  });

  test("엣지: 되돌리기 기록은 남아서 돌아와 되돌릴 수 있다", async ({ page, isMobile }) => {
    await drawWall(page, isMobile);
    await roundTrip(page);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(plan(page)).toHaveAccessibleName(/벽 0개/);
  });

  test("엣지: 메인 화면에서 Ctrl+Z를 눌러도 벽이 지워지지 않는다", async ({ page, isMobile }) => {
    await drawWall(page, isMobile);
    await doneButton(page).click();
    await page.keyboard.press("Control+z");
    await editButton(page).click();
    await expect(plan(page)).toHaveAccessibleName(/벽 1개/);
  });

  test("엣지: 키보드만으로 오가고, 초점은 새 화면 제목으로 간다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await expect(editTitle(page)).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(doneButton(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(mainTitle(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(editButton(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(editTitle(page)).toBeFocused();
  });

  test("엣지: Enter를 두 번 눌러도 메인 화면에 머문다 (초점이 버튼에 남지 않음)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await doneButton(page).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(mainTitle(page)).toBeVisible();
  });

  test("엣지: 완료를 빠르게 두 번 눌러도 메인 화면이다", async ({ page }) => {
    await doneButton(page).dblclick();
    await expect(mainTitle(page)).toBeVisible();
  });

  test("엣지: 구역 선을 긋던 도구로 나갔다 와도 구역 선이 그대로다", async ({ page, isMobile }) => {
    await chooseTool(page, "구역 선");
    await dragCm(
      page,
      [
        { x: 300, y: 15 },
        { x: 300, y: 435 },
      ],
      isMobile,
    );
    await roundTrip(page);
    await expect(plan(page)).toHaveAccessibleName(/구역 선 1개$/);
  });

  test("스크린샷을 남긴다", async ({ page }, testInfo) => {
    await page.screenshot({ path: testInfo.outputPath("edit-top-bar.png"), fullPage: true });
    await doneButton(page).click();
    await page.screenshot({ path: testInfo.outputPath("main.png"), fullPage: true });
  });
});
