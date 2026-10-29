import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, dragScreen, plan, touchSender } from "./helpers";

const viewGroup = (page: Page) => page.getByRole("group", { name: "보기 전환" });
const preview = (page: Page) => page.getByRole("img", { name: /^3D 미리보기,/ });
const viewButton = (page: Page, name: "처음 보기" | "확대" | "축소") =>
  page.getByRole("group", { name: "3D 보기" }).getByRole("button", { name });
const MAX_PRESSES = 30; // 줌 끝까지 누를 때 무한히 돌지 않게

async function openPreview(page: Page) {
  await viewGroup(page).getByRole("button", { name: "3D 미리보기" }).click();
  await expect(preview(page).locator("canvas")).toBeVisible();
  await expect(viewButton(page, "처음 보기")).toBeDisabled();
  await expect(viewButton(page, "확대")).toBeEnabled(); // 카메라가 준비됐다
}
/** 3D 그림의 가운데(px). 크기를 잰 뒤에 읽는다. */
async function center(page: Page) {
  const canvas = preview(page).locator("canvas");
  await expect(async () => {
    expect((await canvas.boundingBox())?.height).toBeGreaterThan(200);
  }).toPass();
  const box = await canvas.boundingBox();
  return { x: (box?.x ?? 0) + (box?.width ?? 0) / 2, y: (box?.y ?? 0) + (box?.height ?? 0) / 2 };
}
/** 버튼이 막힐 때까지 누른다. 누른 횟수를 돌려준다. */
async function pressUntilDisabled(page: Page, name: "확대" | "축소") {
  let presses = 0;
  while ((await viewButton(page, name).isEnabled()) && presses < MAX_PRESSES) {
    await viewButton(page, name).click();
    presses++;
  }
  return presses;
}

test.describe("3D 미리보기 카메라", () => {
  test("끌면 돌아가고, 처음 보기를 누르면 처음 자리로 온다", async ({ page, isMobile }) => {
    const errors = collectErrors(page);
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    const from = await center(page);
    await dragScreen(page, from, { x: from.x + 80, y: from.y + 30 }, isMobile);
    await expect(viewButton(page, "처음 보기")).toBeEnabled();
    await viewButton(page, "처음 보기").click();
    await expect(viewButton(page, "처음 보기")).toBeDisabled();
    expect(errors).toEqual([]);
  });

  test("휠로 줌하고, 오른쪽 끌기로 이동한다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휠·오른쪽 버튼은 데스크톱에서만");
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    const at = await center(page);
    await page.mouse.move(at.x, at.y);
    await page.mouse.wheel(0, -300);
    await expect(viewButton(page, "처음 보기")).toBeEnabled();
    await viewButton(page, "처음 보기").click();

    await page.mouse.move(at.x, at.y);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(at.x + 60, at.y + 40, { steps: 5 });
    await page.mouse.up({ button: "right" });
    await expect(viewButton(page, "처음 보기")).toBeEnabled();
  });

  test("두 손가락을 벌리면 줌된다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "터치는 모바일에서만");
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    const at = await center(page);
    const send = await touchSender(page);
    const fingers = (gap: number) => [
      { x: at.x - gap, y: at.y },
      { x: at.x + gap, y: at.y },
    ];
    await send("touchStart", fingers(20));
    for (const gap of [30, 45, 60, 80]) await send("touchMove", fingers(gap));
    await send("touchEnd", []);
    await expect(viewButton(page, "처음 보기")).toBeEnabled();
  });

  test("엣지: 확대·축소는 끝에서 막힌다 (너무 가깝거나 멀리 가지 않음)", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    expect(await pressUntilDisabled(page, "확대")).toBeLessThan(MAX_PRESSES);
    await expect(viewButton(page, "확대")).toBeDisabled();
    await expect(viewButton(page, "축소")).toBeEnabled();
    expect(await pressUntilDisabled(page, "축소")).toBeLessThan(MAX_PRESSES);
    await expect(viewButton(page, "축소")).toBeDisabled();
    await expect(viewButton(page, "확대")).toBeEnabled();
  });

  test("엣지: 2D 평면도에 갔다 오면 3D 미리보기가 처음 보기로 다시 뜬다", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    await viewButton(page, "확대").click();
    await viewGroup(page).getByRole("button", { name: "2D 평면도" }).click();
    await expect(plan(page)).toBeVisible();
    await openPreview(page); // 처음 보기가 막혀 있다 = 처음 자리
  });

  test("엣지: 아주 작은(1 × 1 m)·아주 큰(30 × 30 m) 바닥도 열리고 줌된다", async ({ page }) => {
    const errors = collectErrors(page);
    for (const size of ["1.0", "30.0"]) {
      await createSpace(page, { width: size, depth: size });
      await openPreview(page);
      await viewButton(page, "확대").click();
      await expect(viewButton(page, "처음 보기")).toBeEnabled();
    }
    expect(errors).toEqual([]);
  });

  test("엣지: 키보드 Tab·Enter로 줌하고 처음 보기로 돌아온다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    await viewButton(page, "확대").focus();
    await page.keyboard.press("Enter");
    await expect(viewButton(page, "처음 보기")).toBeEnabled();
    await page.keyboard.press("Shift+Tab");
    await expect(viewButton(page, "처음 보기")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(viewButton(page, "처음 보기")).toBeDisabled();
  });

  test("엣지: 보기 버튼은 44px이고 3D 미리보기 안에 있으며, 가로 스크롤이 없다", async ({
    page,
  }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    await center(page);
    const area = await preview(page).boundingBox();
    for (const name of ["처음 보기", "확대", "축소"] as const) {
      const box = await viewButton(page, name).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.x ?? 0).toBeGreaterThanOrEqual(area?.x ?? 0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
        (area?.y ?? 0) + (area?.height ?? 0),
      );
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });

  test("스크린샷을 남긴다 (시안 01 왼쪽 아래 버튼과 비교)", async ({ page }, testInfo) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await openPreview(page);
    await page.waitForTimeout(500); // 첫 장면이 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("scene-camera.png"), fullPage: true });
  });
});
