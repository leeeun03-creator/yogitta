import { expect, type Page } from "@playwright/test";

/** 첫 실행 화면에서 바닥 크기를 넣고 공간을 만들어 편집 모드로 들어간다. */
export async function createSpace(page: Page, size: { width: string; depth: string }) {
  await page.goto("./");
  await page.getByLabel("가로 (m)").fill(size.width);
  await page.getByLabel("세로 (m)").fill(size.depth);
  await page.getByRole("button", { name: "벽 그리러 가기" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
}
