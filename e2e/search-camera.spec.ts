import { expect, test, type Page } from "@playwright/test";
import { space3d } from "./scene";
import { card, openSample, searchBox } from "./search";

const resetView = (page: Page) => page.getByRole("button", { name: "처음 보기" });
const pickedPin = (page: Page) => space3d(page).locator("[data-testid=pin][data-picked]");

/** 고른 결과 핀 가운데가 3D 공간 안 어디쯤인지 (0~1, 왼쪽·위가 0). */
async function pinSpot(page: Page) {
  const scene = await space3d(page).boundingBox();
  const pin = await pickedPin(page).boundingBox();
  if (!scene || !pin) return { x: -1, y: -1 };
  return {
    x: (pin.x + pin.width / 2 - scene.x) / scene.width,
    y: (pin.y + pin.height / 2 - scene.y) / scene.height,
  };
}

/** 카메라가 옮겨 가는 동안 핀이 움직이므로, 연달아 잰 자리가 같아질 때(멈춤)까지 기다린 뒤 잰다. */
async function settledPinSpot(page: Page) {
  let last = "";
  await expect
    .poll(
      async () => {
        const now = JSON.stringify(await pinSpot(page));
        const isSame = now === last;
        last = now;
        return isSame;
      },
      { intervals: [200] },
    )
    .toBe(true);
  return pinSpot(page);
}

test.describe("검색 결과를 고르면 카메라가 찾은 칸 정면으로 옮겨 가기", () => {
  // 샘플 공간(내 방)으로 찾는다
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await openSample(page);
    await expect(resetView(page)).toBeDisabled(); // 처음 자리
  });

  test("여권을 찾으면 카메라가 옮겨 가 화장대 서랍장이 가운데 쪽에 크게 보이고, 처음 보기로 돌아온다", async ({
    page,
  }, testInfo) => {
    await searchBox(page).fill("여권");
    await expect(resetView(page)).toBeEnabled();
    const { x, y } = await settledPinSpot(page);
    expect(x).toBeGreaterThan(0.2);
    expect(x).toBeLessThan(0.8);
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(0.7);
    await page.screenshot({ path: testInfo.outputPath("focused.png") });
    await resetView(page).click();
    await expect(resetView(page)).toBeDisabled();
  });

  test("결과를 바꾸면 다시 옮겨 가고, 검색어를 지워도 카메라는 그 자리다", async ({ page }) => {
    await searchBox(page).fill("겨울");
    await expect(resetView(page)).toBeEnabled();
    await resetView(page).click();
    await expect(resetView(page)).toBeDisabled();
    await card(page).getByRole("listitem").nth(1).getByRole("button").click(); // 옷장
    await expect(resetView(page)).toBeEnabled();
    await page.getByRole("button", { name: "검색어 지우기" }).click();
    await expect(resetView(page)).toBeEnabled();
  });

  test("엣지: 다른 공간에만 있으면 카메라를 옮기지 않는다", async ({ page }) => {
    await searchBox(page).fill("충전기");
    await expect(card(page)).toBeVisible();
    await page.waitForTimeout(700);
    await expect(resetView(page)).toBeDisabled();
  });
});
