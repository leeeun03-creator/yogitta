import { expect, test, type Page } from "@playwright/test";
import { createSpace } from "./helpers";
import { placeBox } from "./boxes";
import {
  boxPoint,
  cornerPoint,
  detail,
  openMainScene,
  pickBox,
  settledBox,
  space3d,
} from "./scene";

const label = (page: Page, name: string) =>
  space3d(page).getByTestId("box-label").filter({ hasText: name });
const selectedLabels = (page: Page) => space3d(page).locator("[data-selected]");

test.describe("3D에서 마우스를 올린 가구와 고른 가구 표시", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 50, y: 50 }, { x: 200, y: 150 }, isMobile); // 보관함 1
    await placeBox(page, { x: 350, y: 250 }, { x: 500, y: 350 }, isMobile); // 보관함 2
    await openMainScene(page);
  });

  test("고른 가구는 이름 라벨이 진하게 표시되고, 다른 가구를 고르면 따라간다", async ({
    page,
    isMobile,
  }, testInfo) => {
    await expect(selectedLabels(page)).toHaveCount(0);
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(label(page, "보관함 1")).toHaveAttribute("data-selected", "true");
    await expect(selectedLabels(page)).toHaveCount(1);
    await pickBox(page, space3d(page), "보관함 2", isMobile);
    await expect(label(page, "보관함 2")).toHaveAttribute("data-selected", "true");
    await expect(selectedLabels(page)).toHaveCount(1);
    await settledBox(label(page, "보관함 2"));
    await page.screenshot({ path: testInfo.outputPath("selected.png") });
  });

  test("엣지: 가구 상세 패널을 닫으면 고른 표시가 없어진다", async ({ page, isMobile }) => {
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(selectedLabels(page)).toHaveCount(1);
    await detail(page).getByRole("button", { name: "닫기" }).click();
    await expect(selectedLabels(page)).toHaveCount(0);
  });

  test("엣지: 가구 목록에서 골라도 3D에 표시된다", async ({ page }) => {
    await detail(page)
      .getByRole("button", { name: /^보관함 2 물건 \d+개$/ })
      .click();
    await expect(label(page, "보관함 2")).toHaveAttribute("data-selected", "true");
  });

  test("마우스를 가구에 올리면 밝아지고 손가락 모양이 되며, 벗어나면 원래대로", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "올리기는 마우스만");
    const at = await boxPoint(space3d(page), "보관함 1");
    await page.mouse.move(at.x, at.y);
    await expect(label(page, "보관함 1")).toHaveAttribute("data-hovered", "true");
    await expect(space3d(page)).toHaveCSS("cursor", "pointer");
    const corner = await cornerPoint(page);
    await page.mouse.move(corner.x, corner.y);
    await expect(space3d(page).locator("[data-hovered]")).toHaveCount(0);
    await expect(space3d(page)).toHaveCSS("cursor", "auto");
  });

  test("엣지: 마우스를 누른 채 끄는(돌리는) 동안은 올린 가구가 없다", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "올리기는 마우스만");
    const at = await boxPoint(space3d(page), "보관함 1");
    const corner = await cornerPoint(page);
    await page.mouse.move(corner.x, corner.y);
    await page.mouse.down();
    await page.mouse.move(at.x, at.y, { steps: 5 });
    await expect(space3d(page).locator("[data-hovered]")).toHaveCount(0);
    await page.mouse.up();
  });

  test("엣지: 휴대폰 터치는 올린 가구를 남기지 않는다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "터치는 휴대폰에서만");
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(label(page, "보관함 1")).toHaveAttribute("data-selected", "true");
    await expect(space3d(page).locator("[data-hovered]")).toHaveCount(0);
  });
});
