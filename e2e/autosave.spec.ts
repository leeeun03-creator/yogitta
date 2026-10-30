import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { drawWall, placeBox } from "./boxes";
import { addItem, chips, listButton } from "./items";
import { addSpaceFromList, finishEditing, mainTitle, pill } from "./spaces";

const space3d = (page: Page) => page.getByRole("img", { name: /^3D 공간,/ });

/** 새로고침하고 메인 화면이 다시 뜰 때까지 기다린다. */
async function reload(page: Page) {
  await page.reload();
  await expect(mainTitle(page)).toBeVisible();
}

test.describe("자동 저장하고 새로고침하면 불러오기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await drawWall(page, { x: 20, y: 300 }, { x: 260, y: 300 }, isMobile);
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 보관함 1
  });

  test("물건을 넣고 새로고침해도 공간·벽·가구·물건이 그대로다", async ({ page }) => {
    const errors = collectErrors(page);
    await finishEditing(page);
    await listButton(page, "보관함 1").click();
    await addItem(page, { name: "여권", slot: "보관함 안", memo: "파란 파우치" });
    await reload(page);
    await expect(space3d(page)).toHaveAccessibleName(/벽 1개, 선분 1개, 구역 0개, 가구 1개$/);
    await expect(listButton(page, "보관함 1")).toHaveAccessibleName("보관함 1 물건 1개");
    await listButton(page, "보관함 1").click();
    await expect(chips(page, "보관함 안")).toHaveText(["여권"]);
    expect(errors).toEqual([]);
  });

  test("공간을 바꾸고 새로고침하면 그 공간이 열린다", async ({ page }) => {
    await finishEditing(page);
    await addSpaceFromList(page, "형 방");
    await finishEditing(page);
    await expect(pill(page, "형 방")).toBeVisible();
    await reload(page);
    await expect(pill(page, "형 방")).toBeVisible();
  });

  test("엣지: 화면 상태(편집 모드·고른 가구)와 되돌리기 기록은 저장하지 않는다", async ({
    page,
  }) => {
    // 편집 모드에서 가구를 고른 채(놓은 직후) 새로고침한다
    await reload(page);
    await page.getByRole("button", { name: "편집" }).click();
    await expect(page.getByRole("button", { name: "되돌리기" })).toBeDisabled();
    await expect(page.getByRole("textbox", { name: "가구 이름" })).toHaveCount(0); // 고른 가구 없음
  });

  test("엣지: 편집 모드 상단 바에 자동 저장됨이 보인다 (휴대폰은 좁아서 뺀다)", async ({
    page,
    isMobile,
  }) => {
    const saved = page.getByRole("banner").getByText("자동 저장됨");
    if (isMobile) await expect(saved).toBeHidden();
    else await expect(saved).toBeVisible();
  });
});
