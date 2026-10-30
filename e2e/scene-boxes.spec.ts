import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  collectErrors,
  createSpace,
  dragFloorCm,
  openPreview,
  preview,
  pressCm,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
const MANY_BOXES = 50;
const GRID = { cols: 10, rows: 5 }; // 가구 50개를 놓을 자리 (10 × 5)
type Cm = { x: number; y: number };

const rotateButton = (page: Page) =>
  page.getByRole("complementary", { name: "속성 패널" }).getByRole("button", { name: "90° 회전" });

/** 가구 도구로 끌어 놓는다 (놓으면 그 가구가 골라진다). */
async function placeBox(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "가구");
  await dragFloorCm(page, FLOOR, from, to, isMobile);
}

test.describe("3D에 가구 세우기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("가구를 놓고 3D 미리보기로 바꾸면 가구가 서고(그림 이름에 가구 수) 오류가 없다", async ({
    page,
    isMobile,
  }, testInfo) => {
    const errors = collectErrors(page);
    await placeBox(page, { x: 60, y: 60 }, { x: 180, y: 120 }, isMobile); // 정면 +z(아래)
    await placeBox(page, { x: 300, y: 200 }, { x: 420, y: 260 }, isMobile);
    await rotateButton(page).click(); // 정면 -x(왼쪽)
    await placeBox(page, { x: 480, y: 360 }, { x: 600, y: 450 }, isMobile); // 바닥 오른쪽 아래 끝
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(/가구 3개$/);
    // 휴대폰은 속성 패널이 3D 보기 버튼을 가리지 않게 숨고, 데스크톱은 옆에 그대로다
    const panel = page.getByRole("complementary", { name: "속성 패널" });
    if (isMobile) await expect(panel).toBeHidden();
    else await expect(panel.getByRole("heading", { name: "보관함 3" })).toBeVisible();
    await page.getByRole("button", { name: "확대" }).click(); // 가려져 있으면 누를 수 없다
    await page.waitForTimeout(300); // 3D가 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("scene-boxes.png"), fullPage: true });
    expect(errors).toEqual([]);
  });

  test("메인 화면 3D 공간에도 가구가 선다", async ({ page, isMobile }) => {
    await placeBox(page, { x: 100, y: 100 }, { x: 220, y: 160 }, isMobile);
    await page.getByRole("button", { name: "완료" }).click();
    await expect(page.getByRole("img", { name: /^3D 공간,/ })).toHaveAccessibleName(/가구 1개$/);
  });

  test("엣지: 가구 50개에서도 3D 미리보기가 오류 없이 뜬다", async ({ page, isMobile }) => {
    test.setTimeout(120_000); // 가구 50개를 하나씩 놓는다
    const errors = collectErrors(page);
    for (let index = 0; index < MANY_BOXES; index++) {
      const col = index % GRID.cols;
      const row = Math.floor(index / GRID.cols);
      const at = { x: 30 + col * 60, y: 45 + row * 90 };
      await chooseTool(page, "가구");
      await pressCm(page, FLOOR, [at], isMobile);
    }
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(/가구 50개$/);
    expect(errors).toEqual([]);
  });
});
