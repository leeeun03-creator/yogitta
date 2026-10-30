import { expect, test } from "@playwright/test";
import { createSpace, floorBox, pressCm } from "./helpers";
import { FLOOR, detailsToggle, nameField, panel, placeBox, sizeField, typeButton } from "./boxes";

test.describe("휴대폰 속성 패널 접었다 펴기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 보관함 1, 가운데 (200, 125)
  });

  test("휴대폰: 처음엔 종류·크기가 접혀 이름·구역·회전·삭제만 보이고 2D 평면도 바닥을 가리지 않는다", async ({
    page,
    isMobile,
  }, testInfo) => {
    test.skip(!isMobile, "휴대폰 화면에서만");
    await expect(detailsToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(typeButton(page, "서랍장")).toBeHidden();
    await expect(nameField(page)).toBeVisible();
    await expect(panel(page).getByRole("button", { name: "90° 회전" })).toBeVisible();
    await expect(panel(page).getByRole("button", { name: "삭제" })).toBeVisible();
    const floor = await floorBox(page);
    const sheet = await panel(page).boundingBox();
    expect(sheet?.y ?? 0).toBeGreaterThanOrEqual(floor.y + floor.height); // 바닥 아래에서 시작한다
    await page.screenshot({ path: testInfo.outputPath("panel-folded.png"), fullPage: true });
  });

  test("휴대폰: [종류·크기]를 누르면 펼쳐져 종류를 바꿀 수 있고, 다시 누르면 접힌다", async ({
    page,
    isMobile,
  }, testInfo) => {
    test.skip(!isMobile, "휴대폰 화면에서만");
    await detailsToggle(page).click();
    await expect(detailsToggle(page)).toHaveAttribute("aria-expanded", "true");
    await typeButton(page, "서랍장").click();
    await expect(nameField(page)).toHaveValue("서랍장 1");
    await expect(sizeField(page, "가로")).toHaveValue("200");
    await page.screenshot({ path: testInfo.outputPath("panel-expanded.png"), fullPage: true });
    await detailsToggle(page).click();
    await expect(detailsToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(typeButton(page, "서랍장")).toBeHidden();
  });

  test("엣지: 펼친 채로 다른 가구를 골라도 펼친 상태가 이어진다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "휴대폰 화면에서만");
    await placeBox(page, { x: 350, y: 50 }, { x: 550, y: 200 }, isMobile); // 보관함 2 (골라짐)
    await detailsToggle(page).click();
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], isMobile); // 보관함 1을 고른다
    await expect(nameField(page)).toHaveValue("보관함 1");
    await expect(detailsToggle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(typeButton(page, "보관함")).toBeVisible();
  });

  test("엣지: 데스크톱은 접기 버튼 없이 종류·크기가 늘 보인다", async ({ page, isMobile }) => {
    test.skip(isMobile, "데스크톱에서만");
    await expect(detailsToggle(page)).toBeHidden();
    await expect(typeButton(page, "서랍장")).toBeVisible();
    await expect(sizeField(page, "가로")).toHaveValue("200");
  });
});
