import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  collectErrors,
  createSpace,
  plan,
  preview,
  pressCm,
  viewGroup,
  wallPoints,
} from "./helpers";

const FLOOR = { w: 600, h: 450 };
const planButton = (page: Page) => viewGroup(page).getByRole("button", { name: "2D 평면도" });
const previewButton = (page: Page) => viewGroup(page).getByRole("button", { name: "3D 미리보기" });

test.describe("2D 평면도 / 3D 미리보기 전환", () => {
  test("상단 바의 전환 버튼으로 3D 미리보기를 열고 2D 평면도로 돌아온다", async ({ page }) => {
    const errors = collectErrors(page);
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await expect(page.getByRole("banner").getByRole("group", { name: "보기 전환" })).toBeVisible();
    await expect(planButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(previewButton(page)).toHaveAttribute("aria-pressed", "false");

    await previewButton(page).click();
    await expect(previewButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(preview(page)).toHaveAccessibleName(
      "3D 미리보기, 바닥 6.0 × 4.5 m, 벽 0개, 선분 0개, 구역 0개, 가구 0개",
    );
    await expect(plan(page)).toHaveCount(0);
    // 3D 그림판(canvas)이 영역을 채운다. 처음엔 기본 크기(300×150)였다가 영역을 잰 뒤 커지므로 다시 읽는다
    const canvas = preview(page).locator("canvas");
    await expect(async () => {
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(200);
      expect(box?.height).toBeGreaterThan(200);
    }).toPass();

    await planButton(page).click();
    await expect(plan(page)).toBeVisible();
    await expect(preview(page)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("2D 평면도에 그린 벽은 3D에 갔다 와도 그대로다", async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "직선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 100, y: 100 },
        { x: 500, y: 100 },
      ],
      isMobile,
    );
    await previewButton(page).click();
    await expect(preview(page)).toBeVisible();
    await planButton(page).click();
    expect(await wallPoints(page)).toEqual([
      [
        [100, 100],
        [500, 100],
      ],
    ]);
    // 고른 도구도 그대로다
    await expect(page.getByRole("button", { name: "직선", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("3D 코드는 처음 3D 미리보기를 열 때 불러온다", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });
    await createSpace(page, { width: "6.0", depth: "4.5" });
    const isPreviewCode = (url: string) => /PreviewCanvas/.test(url);
    expect(scripts.some(isPreviewCode)).toBe(false);
    await previewButton(page).click();
    await expect(preview(page).locator("canvas")).toBeVisible();
    expect(scripts.some(isPreviewCode)).toBe(true);
  });

  test("엣지: 3D 미리보기에서는 그리기 도구가 막히고, 돌아오면 풀린다", async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    const tools = page.getByRole("toolbar", { name: "그리기 도구" }).getByRole("button");
    await previewButton(page).click();
    for (const tool of await tools.all()) await expect(tool).toBeDisabled();
    await planButton(page).click();
    for (const tool of await tools.all()) await expect(tool).toBeEnabled();
  });

  test("엣지: 3D 미리보기에서도 되돌리기·다시하기가 된다", async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "직선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 100, y: 100 },
        { x: 500, y: 100 },
      ],
      isMobile,
    );
    await previewButton(page).click();
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(page.getByRole("button", { name: "되돌리기" })).toBeDisabled();
    if (!isMobile) {
      await page.keyboard.press("Control+y");
      await expect(page.getByRole("button", { name: "다시하기" })).toBeDisabled();
    }
    await planButton(page).click();
    expect(await wallPoints(page)).toHaveLength(isMobile ? 0 : 1);
  });

  test("엣지: 키보드 Tab·Enter로 바꿀 수 있다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await planButton(page).focus();
    await page.keyboard.press("Tab");
    await expect(previewButton(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(preview(page)).toBeVisible();
  });

  test("엣지: 전환 버튼은 터치 영역 44px이고, 360px에서도 상단 바가 넘치지 않는다", async ({
    page,
  }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    for (const button of [planButton(page), previewButton(page)]) {
      expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    const banner = await page.getByRole("banner").boundingBox();
    const group = await viewGroup(page).boundingBox();
    expect((group?.x ?? 0) + (group?.width ?? 0)).toBeLessThanOrEqual(
      (banner?.x ?? 0) + (banner?.width ?? 0),
    );
    await previewButton(page).click();
    await expect(preview(page)).toBeVisible();
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });

  test("엣지: 3D를 못 그리는 브라우저에서는 안내 문구가 나온다", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      // WebGL만 못 쓰게 막는다 (2D 그림 등 다른 것은 그대로)
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args) {
        if (String(args[0]).startsWith("webgl")) return null;
        return original.apply(this, args as Parameters<typeof original>);
      } as typeof original;
    });
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await previewButton(page).click();
    // 화면 아래 저장 안내 자리도 status라 3D 미리보기 영역 안에서 찾는다
    await expect(
      page.getByRole("region", { name: "3D 미리보기 영역" }).getByRole("status"),
    ).toHaveText(/이 브라우저에서는 3D를 볼 수 없어요/);
    await expect(page.locator("canvas")).toHaveCount(0);
    await planButton(page).click();
    await expect(plan(page)).toBeVisible();
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page }, testInfo) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await previewButton(page).click();
    await expect(preview(page).locator("canvas")).toBeVisible();
    await page.waitForTimeout(500); // 첫 장면이 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("view-switch.png"), fullPage: true });
  });
});
