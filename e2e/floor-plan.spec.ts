import { expect, test, type Page } from "@playwright/test";
import { createSpace, plan } from "./helpers";

function floorPlan(page: Page) {
  return page.getByRole("img", { name: /^2D 평면도/ });
}

/** 바닥 사각형이 2D 평면도 영역 안에 다 들어오는지 확인한다. */
async function expectFloorInside(page: Page) {
  const area = await page.getByRole("region", { name: "2D 평면도 영역" }).boundingBox();
  const floor = await plan(page).getByTestId("floor").boundingBox();
  expect(area && floor).toBeTruthy();
  if (!area || !floor) return;
  expect(floor.x).toBeGreaterThanOrEqual(area.x);
  expect(floor.y).toBeGreaterThanOrEqual(area.y);
  expect(floor.x + floor.width).toBeLessThanOrEqual(area.x + area.width + 1);
  expect(floor.y + floor.height).toBeLessThanOrEqual(area.y + area.height + 1);
  return floor;
}

test.describe("편집 모드 2D 평면도", () => {
  test("원룸 6.0 × 4.5 바닥에 치수와 50cm 격자가 그려진다", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await expect(page.getByText("내 방 · 6.0 × 4.5 m")).toBeVisible();
    await expect(floorPlan(page)).toHaveAccessibleName(
      "2D 평면도, 바닥 6.0 m × 4.5 m, 벽 0개, 구역 선 0개",
    );
    await expect(floorPlan(page).getByText("6.0 m", { exact: true })).toBeVisible();
    await expect(floorPlan(page).getByText("4.5 m", { exact: true })).toBeVisible();
    // 가로 11개 + 세로 8개 (양 끝은 바닥 테두리)
    await expect(plan(page).getByTestId("grid").locator("line")).toHaveCount(19);
    await expectFloorInside(page);
  });

  test("바닥 비율이 cm 비율과 같다 (찌그러지지 않는다)", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    const floor = await expectFloorInside(page);
    expect((floor?.width ?? 0) / (floor?.height ?? 1)).toBeCloseTo(600 / 450, 1);
  });

  test("치수 글자는 바닥 크기와 상관없이 화면에서 14px 정도다", async ({ page }) => {
    for (const size of [
      { width: "1", depth: "1" },
      { width: "30", depth: "30" },
    ]) {
      await createSpace(page, size);
      const label = floorPlan(page)
        .getByText(`${size.width === "1" ? "1.0" : "30.0"} m`)
        .first();
      const box = await label.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThan(12);
      expect(box?.height ?? 0).toBeLessThan(24);
    }
  });

  const EDGE_FLOORS = [
    { width: "1", depth: "1", lines: 2 },
    { width: "30", depth: "30", lines: 118 },
    { width: "30", depth: "1", lines: 60 },
    { width: "4.55", depth: "3", lines: 14 },
  ];
  for (const { width, depth, lines } of EDGE_FLOORS) {
    test(`엣지: ${width} × ${depth} m 바닥도 영역 안에 다 보인다`, async ({ page }) => {
      await createSpace(page, { width, depth });
      await expect(plan(page).getByTestId("grid").locator("line")).toHaveCount(lines);
      await expectFloorInside(page);
    });
  }

  test("가로 스크롤이 생기지 않는다", async ({ page }) => {
    await createSpace(page, { width: "30", depth: "1" });
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(contentWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page }, testInfo) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath("edit-mode.png"), fullPage: true });
  });
});
