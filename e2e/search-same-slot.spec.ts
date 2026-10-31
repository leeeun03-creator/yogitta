import { expect, test, type Page } from "@playwright/test";
import { card, openSample, searchBox } from "./search";

const sameSlot = (page: Page) => card(page).getByRole("list", { name: "같은 칸에 있는 물건" });

test.describe("결과 카드에 같은 칸에 있는 물건 보여주기", () => {
  // 샘플 공간(내 방): 화장대 서랍장 2번째 서랍에 여권·비상금
  test.use({ storageState: { cookies: [], origins: [] } });

  test("여권을 찾으면 같은 서랍의 비상금이 칩으로 보인다", async ({ page }, testInfo) => {
    await openSample(page);
    await searchBox(page).fill("여권");
    await expect(sameSlot(page).getByRole("listitem")).toHaveText(["비상금"]);
    await page.screenshot({ path: testInfo.outputPath("same-slot.png") });
  });
});
