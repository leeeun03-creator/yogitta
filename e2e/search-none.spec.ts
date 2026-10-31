import { expect, test } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { detail } from "./scene";
import { finishEditing } from "./spaces";
import { card, noResult, openSample, searchBox } from "./search";

test.describe("결과가 없으면 아직 어딨는지 몰라요와 바로 넣기", () => {
  // 샘플 공간(내 방)에서 찾는다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
  });

  test("'선크림'을 찾으면 결과 없음 카드와 [+ 물건 넣기]가 보이고, 요깃따!는 쓰지 않는다", async ({
    page,
  }, testInfo) => {
    await searchBox(page).fill("선크림");
    await expect(noResult(page)).toContainText("'선크림'은 등록된 위치가 없어요. 지금 등록할까요?");
    await expect(noResult(page).getByRole("button", { name: "물건 넣기" })).toBeVisible();
    await expect(page.getByText("요깃따!")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("no-result.png") });
  });

  test("[+ 물건 넣기]로 이름이 채워진 입력에서 가구·칸을 골라 넣으면 바로 요깃따! 카드가 된다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await searchBox(page).fill("선크림");
    await noResult(page).getByRole("button", { name: "물건 넣기" }).click();
    const add = noResult(page).getByRole("form", { name: "물건 넣기" });
    await expect(add.getByLabel("물건 이름")).toHaveValue("선크림");
    await add.getByLabel("가구").selectOption({ label: "책상" });
    await add.getByLabel("칸").selectOption({ label: "상판 위" });
    await add.getByLabel("메모 (선택)").fill("여름용");
    await add.getByRole("button", { name: "넣기" }).click();
    await expect(card(page)).toContainText("선크림은 내 방의 책상 위에 보관 중이에요.");
    await expect(card(page)).toContainText("여름용");
    if (!isMobile) await expect(detail(page).getByRole("heading", { name: "책상" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("엣지: 은/는은 받침으로 고르고, 아주 긴 검색어도 카드가 화면을 넘치지 않는다", async ({
    page,
  }) => {
    await searchBox(page).fill("가위");
    await expect(noResult(page)).toContainText("'가위'는 등록된 위치가 없어요.");
    await searchBox(page).fill("아주아주긴검색어".repeat(8));
    await expect(noResult(page)).toBeVisible();
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
});

test.describe("결과 없음: 가구가 없는 공간", () => {
  test("엣지: 지금 공간에 가구가 없으면 [편집]에서 가구를 놓으라고만 안내한다", async ({
    page,
  }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await finishEditing(page);
    await searchBox(page).fill("여권");
    await expect(noResult(page)).toContainText("[편집]에서 가구를 놓으면 넣을 수 있어요.");
    await expect(noResult(page).getByRole("button", { name: "물건 넣기" })).toHaveCount(0);
  });
});
