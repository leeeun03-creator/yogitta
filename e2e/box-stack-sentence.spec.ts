import { expect, test, type Page } from "@playwright/test";
import { dragFloorCm, pressCm } from "./helpers";
import { FLOOR, renameBox } from "./boxes";
import { addItem, listButton } from "./items";
import { detail } from "./scene";
import { card, searchBox } from "./search";
import { finishEditing } from "./spaces";
import { expectSaved, placeDeskAndBox, stackBoxOnDesk } from "./stack";

/** 메인 화면에서 충전기를 찾아 결과 카드의 위치 문장을 본다. */
async function searchCharger(page: Page) {
  await searchBox(page).fill("충전기");
  await expect(card(page)).toBeVisible();
}

test.describe('위치 문장과 가구 상세 패널에 "책상 위 보관함" 보여주기', () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  // 보관함 1을 책상 1 위에 올리고 메인 화면에서 보관함 1에 충전기를 넣는다
  test.beforeEach(async ({ page, isMobile }) => {
    await placeDeskAndBox(page, isMobile);
    await stackBoxOnDesk(page, isMobile);
    await finishEditing(page);
    await listButton(page, "보관함 1").click();
    await expect(detail(page).getByRole("heading", { name: "보관함 1" })).toBeVisible();
    await addItem(page, { name: "충전기" });
  });

  test('가구 상세 패널 머리에 "책상 1 위"가 보이고, 찾으면 위치 문장에 "책상 1 위 보관함 1"이 들어간다', async ({
    page,
  }, testInfo) => {
    await expect(detail(page).getByText("책상 1 위 · 구역 없음 · 물건 1개")).toBeVisible();
    await searchCharger(page);
    await expect(card(page)).toContainText(
      "충전기는 내 방의 책상 1 위 보관함 1 안에 보관 중이에요.",
    );
    await expect(
      card(page).locator("strong").filter({ hasText: "책상 1 위 보관함 1" }),
    ).toHaveCount(1);
    await expect(page.getByRole("button", { name: "확대" })).toBeEnabled(); // 3D가 뜬 뒤 찍는다
    await page.screenshot({ path: testInfo.outputPath("sentence.png") });
  });

  test("엣지: 받침 가구 이름을 바꾸면 문장도 바뀌고, 바닥으로 내리면 다시 가구 이름만 나온다", async ({
    page,
    isMobile,
  }) => {
    await page.getByRole("button", { name: "편집" }).click();
    await pressCm(page, FLOOR, [{ x: 260, y: 200 }], isMobile); // 책상 1 빈 곳
    await renameBox(page, "공부 책상");
    await finishEditing(page);
    await searchCharger(page);
    await expect(card(page)).toContainText("내 방의 공부 책상 위 보관함 1 안에");

    await page.getByRole("button", { name: "편집" }).click();
    await dragFloorCm(page, FLOOR, { x: 330, y: 205 }, { x: 480, y: 205 }, isMobile);
    await expectSaved(page, ["보관함 1", 0, null]);
    await finishEditing(page);
    await searchCharger(page);
    await expect(card(page)).toContainText("충전기는 내 방의 보관함 1 안에 보관 중이에요.");
  });
});
