import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, openPreview, preview, viewGroup } from "./helpers";
import { placeBox, renameBox } from "./boxes";
import { finishEditing } from "./spaces";

const labels = (page: Page) => preview(page).getByTestId("box-label");
const SURFACE = "rgb(255, 250, 243)"; // --yg-surface

test.describe("3D에 가구 이름 라벨 띄우기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 50, y: 50 }, { x: 170, y: 110 }, isMobile); // 보관함 1
    await placeBox(page, { x: 300, y: 50 }, { x: 400, y: 100 }, isMobile); // 보관함 2 (골라짐)
  });

  test("3D 미리보기에 가구마다 이름 라벨이 뜨고, 이름을 바꾸면 따라 바뀐다", async ({ page }) => {
    const errors = collectErrors(page);
    await renameBox(page, "화장대 서랍장");
    await openPreview(page);
    await expect(labels(page)).toHaveText(["보관함 1", "화장대 서랍장"]);
    await viewGroup(page).getByRole("button", { name: "2D 평면도" }).click();
    await renameBox(page, "큰 서랍장");
    await openPreview(page);
    await expect(labels(page)).toHaveText(["보관함 1", "큰 서랍장"]);
    expect(errors).toEqual([]);
  });

  test("메인 화면 3D 공간에도 이름 라벨이 뜬다", async ({ page }) => {
    await finishEditing(page);
    const space = page.getByRole("img", { name: /^3D 공간,/ });
    await expect(space.getByTestId("box-label")).toHaveText(["보관함 1", "보관함 2"]);
  });

  test("엣지: 라벨은 바탕색 알약이고(강조색 아님) 휴대폰에서도 글자가 12px 이상이다", async ({
    page,
  }, testInfo) => {
    await openPreview(page);
    const label = labels(page).first();
    await expect(label).toHaveCSS("background-color", SURFACE);
    const fontSize = await label.evaluate((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(12);
    await page.screenshot({ path: testInfo.outputPath("scene-labels.png"), fullPage: true });
  });

  test("엣지: 라벨은 보기 버튼(처음 보기·확대·축소)보다 아래 겹에 있어 버튼을 가리지 않는다", async ({
    page,
  }) => {
    await openPreview(page);
    const buttons = page.getByRole("button", { name: "확대" }).locator("..");
    const buttonLayer = await buttons.evaluate((element) =>
      Number(getComputedStyle(element).zIndex),
    );
    const labelLayers = await labels(page).evaluateAll((elements) =>
      elements.map((element) => {
        const wrapper = element.closest<HTMLElement>("[style*='z-index']");
        return Number(wrapper?.style.zIndex ?? 0);
      }),
    );
    expect(Math.max(...labelLayers)).toBeLessThan(buttonLayer);
  });

  test("엣지: 가구를 지우면 그 가구의 라벨도 사라진다", async ({ page }) => {
    await page.keyboard.press("Delete"); // 고른 보관함 2를 지운다 (2D 평면도에 초점)
    await openPreview(page);
    await expect(labels(page)).toHaveText(["보관함 1"]);
  });
});
