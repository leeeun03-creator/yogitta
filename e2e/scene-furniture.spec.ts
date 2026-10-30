import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, openPreview, preview } from "./helpers";
import { panel, placeBox } from "./boxes";

type Cm = { x: number; y: number };

const typeButton = (page: Page, name: string) =>
  panel(page).getByRole("group", { name: "종류" }).getByRole("button", { name, exact: true });

/** 가구를 놓고 종류를 고른다. 기본 높이 버튼이 있으면 눌러 그 종류 높이로 세운다. */
async function placeAs(page: Page, type: string, from: Cm, to: Cm, isMobile: boolean) {
  await placeBox(page, from, to, isMobile);
  await typeButton(page, type).click();
  const typeHeight = panel(page).getByRole("button", { name: /^기본 높이/ });
  if ((await typeHeight.count()) > 0) await typeHeight.click();
}

test.describe("3D에 가구 종류별 모양 세우기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test("수납 가구 4종(양문 수납장·서랍장·선반·벽걸이)이 3D 미리보기에 오류 없이 선다", async ({
    page,
    isMobile,
  }, testInfo) => {
    const errors = collectErrors(page);
    await createSpace(page, { width: "6.0", depth: "4.5" });
    // 휴대폰은 고른 가구의 속성 패널이 바닥 아래쪽을 가려서 모두 위쪽에 놓는다
    await placeAs(page, "양문 수납장", { x: 20, y: 20 }, { x: 140, y: 80 }, isMobile);
    await placeAs(page, "서랍장", { x: 180, y: 20 }, { x: 260, y: 70 }, isMobile);
    await placeAs(page, "선반", { x: 300, y: 20 }, { x: 400, y: 60 }, isMobile);
    await placeAs(page, "벽걸이", { x: 440, y: 20 }, { x: 560, y: 60 }, isMobile);
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(/가구 4개$/);
    await page.waitForTimeout(300); // 3D가 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("scene-furniture.png"), fullPage: true });
    expect(errors).toEqual([]);
  });
});
