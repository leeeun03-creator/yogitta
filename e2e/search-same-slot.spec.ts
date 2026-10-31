import { expect, test, type Page } from "@playwright/test";
import { card, openSample, searchBox } from "./search";

const sameSlot = (page: Page) => card(page).getByRole("list", { name: "같은 칸에 있는 물건" });

test.describe("결과 카드에 같은 칸에 있는 물건 보여주기", () => {
  // 샘플 공간(내 방): 화장대 서랍장 2번째 서랍에 여권·비상금
  test.use({ storageState: { cookies: [], origins: [] } });

  test("여권을 찾으면 같은 서랍의 비상금이 칩으로 보인다", async ({ page }, testInfo) => {
    await openSample(page);
    await searchBox(page).fill("여권");
    await expect(sameSlot(page).getByRole("button")).toHaveText(["비상금"]);
    await page.screenshot({ path: testInfo.outputPath("same-slot.png") });
  });

  test("같은 칸 물건 칩을 누르면 그 물건을 찾는다", async ({ page }) => {
    await openSample(page);
    await searchBox(page).fill("여권");
    await sameSlot(page).getByRole("button", { name: "비상금 찾기" }).click();
    await expect(searchBox(page)).toHaveValue("비상금");
    await expect(card(page)).toContainText("비상금은 내 방의 화장대 서랍장");
  });
});
