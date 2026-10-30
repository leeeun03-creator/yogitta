import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  collectErrors,
  createSpace,
  dragFloorCm,
  openPreview,
  plan,
  preview,
  pressCm,
  viewGroup,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

async function openPlan(page: Page) {
  await viewGroup(page).getByRole("button", { name: "2D 평면도" }).click();
  await expect(plan(page)).toBeVisible();
}
const drawRect = (page: Page, from: Cm, to: Cm, isMobile: boolean) =>
  chooseTool(page, "사각형").then(() => dragFloorCm(page, FLOOR, from, to, isMobile));
/** 연속선으로 벽을 그리고 첫 점을 다시 눌러 닫는다. */
async function drawClosedPolyline(page: Page, points: Cm[], isMobile: boolean) {
  await chooseTool(page, "연속선");
  await pressCm(page, FLOOR, [...points, ...points.slice(0, 1)], isMobile);
}
const expectCounts = (page: Page, walls: number, segments: number) =>
  expect(preview(page)).toHaveAccessibleName(
    `3D 미리보기, 바닥 6.0 × 4.5 m, 벽 ${walls}개, 선분 ${segments}개, 구역 0개, 가구 0개`,
  );

test.describe("3D 미리보기의 벽", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("사각형 벽을 그리고 3D 미리보기로 바꾸면 선분 4개가 선다", async ({ page, isMobile }) => {
    const errors = collectErrors(page);
    await drawRect(page, { x: 100, y: 50 }, { x: 400, y: 300 }, isMobile);
    await openPreview(page);
    await expectCounts(page, 1, 4);
    expect(errors).toEqual([]);
  });

  test("3D 미리보기에서 되돌리면 벽이 사라지고, 다시하면 돌아온다", async ({ page, isMobile }) => {
    await drawRect(page, { x: 100, y: 50 }, { x: 400, y: 300 }, isMobile);
    await openPreview(page);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expectCounts(page, 0, 0);
    await page.getByRole("button", { name: "다시하기" }).click();
    await expectCounts(page, 1, 4);
  });

  test("엣지: 벽이 없어도 바닥만 보이고 오류가 없다", async ({ page }) => {
    const errors = collectErrors(page);
    await openPreview(page);
    await expectCounts(page, 0, 0);
    expect(errors).toEqual([]);
  });

  test("엣지: 닫힌 연속선은 마지막 점 → 첫 점 선분까지 선다", async ({ page, isMobile }) => {
    const triangle = [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
      { x: 250, y: 350 },
    ];
    await drawClosedPolyline(page, triangle, isMobile);
    await openPreview(page);
    await expectCounts(page, 1, 3);
  });

  test("엣지: 바닥 가장자리에 그린 벽도 선다", async ({ page, isMobile }) => {
    const errors = collectErrors(page);
    await drawRect(page, { x: 0, y: 0 }, { x: 600, y: 450 }, isMobile);
    await openPreview(page);
    await expectCounts(page, 1, 4);
    expect(errors).toEqual([]);
  });

  test("엣지: 지우개로 가운데 선분을 지우면 3D에서도 빠진다", async ({ page, isMobile }) => {
    await drawClosedPolyline(
      page,
      [
        { x: 100, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 300 },
        { x: 100, y: 300 },
      ],
      isMobile,
    );
    await chooseTool(page, "지우개");
    await pressCm(page, FLOOR, [{ x: 250, y: 100 }], isMobile); // 위쪽 변
    await openPreview(page);
    await expectCounts(page, 1, 3);
    // 2D로 돌아가 하나 더 지우면 벽이 둘로 나뉜다
    await openPlan(page);
    await chooseTool(page, "지우개");
    await pressCm(page, FLOOR, [{ x: 250, y: 300 }], isMobile); // 아래쪽 변 (가운데 선분)
    await openPreview(page);
    await expectCounts(page, 2, 2);
  });

  test("스크린샷을 남긴다 (시안 04·01과 비교)", async ({ page, isMobile }, testInfo) => {
    await drawRect(page, { x: 0, y: 0 }, { x: 600, y: 450 }, isMobile);
    await chooseTool(page, "직선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 300, y: 0 },
        { x: 300, y: 250 },
      ],
      isMobile,
    );
    await openPreview(page);
    await page.waitForTimeout(500); // 첫 장면이 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("scene-walls.png"), fullPage: true });
  });
});
