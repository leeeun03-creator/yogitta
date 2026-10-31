import { expect, test, type Page } from "@playwright/test";
import { setSavedData } from "./helpers";
import { detail } from "./scene";
import { pill } from "./spaces";
import { card, openSample, searchBox } from "./search";

const link = (page: Page, name: string) =>
  card(page).getByRole("button", { name: new RegExp(`^${name} \\d+곳`) });

/** 공간 하나: 보관함 하나에 이름이 name인 물건 count개. */
function savedSpace(id: string, name: string, count: number) {
  const items = Array.from({ length: count }, (_, index) => ({
    id: `${id}_item_${index}`,
    name: "여권",
  }));
  const box = { id: `${id}_box`, name: "보관함", type: "box", x: 100, z: 100, rotation: 0 };
  const size = { w: 50, d: 40, h: 40, elevation: 0, rows: 1, cols: 1 };
  return {
    id,
    name,
    floor: { w: 600, h: 450 },
    rooms: [],
    walls: [],
    boxes: [{ ...box, ...size, items }],
  };
}

test.describe("다른 공간에서 찾은 결과로 그 공간에 가기", () => {
  // 샘플 공간: 여권이 내 방(화장대 서랍장)과 형 방(형 책상)에 있고, 충전기는 형 방에만 있다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
  });

  test("다른 공간에도 있으면 링크가 보이고, 누르면 그 공간의 결과가 보인다", async ({
    page,
    isMobile,
  }, testInfo) => {
    await searchBox(page).fill("여권");
    await expect(card(page)).toContainText("다른 공간에도 있어요:");
    await card(page).screenshot({ path: testInfo.outputPath("elsewhere.png") });
    await link(page, "형 방").click();
    await expect(pill(page, "형 방")).toBeVisible();
    await expect(searchBox(page)).toHaveValue("여권"); // 검색어는 그대로
    await expect(card(page)).toContainText("여권은 형 방의 형 책상 위에 보관 중이에요.");
    await expect(link(page, "내 방")).toHaveText("내 방 1곳 ›");
    if (!isMobile)
      await expect(detail(page).getByRole("heading", { name: "형 책상" })).toBeVisible();
  });

  test("엣지: 지금 공간에 없고 다른 공간에만 있으면 '다른 공간에서 1곳 찾음'과 링크만 보인다", async ({
    page,
  }) => {
    await searchBox(page).fill("충전기");
    await expect(card(page)).toContainText("'충전기' 다른 공간에서 1곳 찾음");
    await expect(card(page)).toContainText("다른 공간에 있어요:");
    await expect(card(page).getByRole("button", { name: /전체 보기/ })).toHaveCount(0);
    await link(page, "형 방").click();
    await expect(card(page)).toContainText(
      "충전기는 형 방의 서랍장 위에서 1번째 서랍에 보관 중이에요.",
    );
  });

  test("엣지: 공간이 여럿이면 공간마다 링크가 있다", async ({ page }) => {
    const data = {
      version: 1,
      currentSpaceId: "a",
      spaces: [savedSpace("a", "거실", 0), savedSpace("b", "형 방", 1), savedSpace("c", "창고", 2)],
    };
    await setSavedData(page, JSON.stringify(data));
    await page.reload();
    await searchBox(page).fill("여권");
    await expect(card(page)).toContainText("'여권' 다른 공간에서 3곳 찾음");
    await expect(card(page).getByRole("button", { name: /곳 ›$/ })).toHaveText([
      "형 방 1곳 ›",
      "창고 2곳 ›",
    ]);
  });
});
