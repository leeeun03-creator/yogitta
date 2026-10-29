import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, openPreview, preview, pressCm } from "./helpers";
import { makeRoom, splitAt } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const nameWith = (rooms: number) =>
  `3D 미리보기, 바닥 6.0 × 4.5 m, 벽 0개, 선분 0개, 구역 ${rooms}개`;
const backToPlan = (page: Page) =>
  page.getByRole("group", { name: "보기 전환" }).getByRole("button", { name: "2D 평면도" }).click();

test.describe("3D 미리보기 바닥의 구역 색", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await splitAt(page, [300], isMobile);
    await makeRoom(page, "안방", { x: 150, y: 200 }, isMobile);
    await makeRoom(page, "거실", { x: 450, y: 200 }, isMobile);
  });

  test("구역을 만들고 3D 미리보기로 바꾸면 구역 수가 나오고, 구역 선은 벽으로 서지 않는다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(nameWith(2));
    expect(errors).toEqual([]);
  });

  test("3D 미리보기에서 되돌리면 구역이 바로 빠진다", async ({ page }) => {
    await openPreview(page);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(preview(page)).toHaveAccessibleName(nameWith(1));
  });

  test("엣지: 가르던 구역 선을 지우면 합쳐진 구역 하나만 칠한다", async ({ page, isMobile }) => {
    await chooseTool(page, "지우개");
    await pressCm(page, FLOOR, [{ x: 300, y: 225 }], isMobile);
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(nameWith(1));
  });

  test("엣지: 2D에서 구역을 지우고 다시 보면 색도 빠진다", async ({ page }) => {
    await openPreview(page);
    await backToPlan(page);
    const list = page.getByRole("list", { name: "구역" });
    await list.getByRole("button", { name: "거실", exact: true }).click();
    await page.getByRole("button", { name: "삭제" }).click();
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(nameWith(1));
  });

  test("스크린샷을 남긴다 (구역 색이 바닥에 옅게 깔리고 격자선이 보인다)", async ({
    page,
  }, testInfo) => {
    await openPreview(page);
    await page.waitForTimeout(500); // 첫 장면이 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("scene-rooms.png"), fullPage: true });
  });
});
