import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, plan } from "./helpers";
import { drawWall, placeBox } from "./boxes";

const sizeButton = (page: Page, label: string) =>
  page.getByRole("button", { name: `바닥 ${label} m`, exact: true });
const dialog = (page: Page) => page.getByRole("dialog", { name: "바닥 크기 바꾸기" });
const OUTSIDE = "벽·구역 선·가구가 바닥 밖으로 나가서 이 크기로 줄일 수 없어요";

/** 바닥 크기 대화상자를 열어 가로·세로(m)를 넣고 [바꾸기]. */
async function resize(page: Page, from: string, width: string, depth: string) {
  await sizeButton(page, from).click();
  await dialog(page).getByLabel("가로 (m)").fill(width);
  await dialog(page).getByLabel("세로 (m)").fill(depth);
  await dialog(page).getByRole("button", { name: "바꾸기" }).click();
}

test.describe("바닥 크기 바꾸기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("늘리면 2D 평면도·버튼·상단 바가 따라 바뀌고, 되돌리기 한 번에 돌아온다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await resize(page, "6.0 × 4.5", "8.0", "5");
    await expect(dialog(page)).toBeHidden();
    await expect(sizeButton(page, "8.0 × 5.0")).toBeVisible();
    await expect(plan(page)).toHaveAccessibleName(/^2D 평면도, 바닥 8\.0 m × 5\.0 m,/);
    await expect(page.getByText("내 방 · 8.0 × 5.0 m")).toBeVisible();
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(sizeButton(page, "6.0 × 4.5")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("엣지: 줄여서 벽이 바닥 밖으로 나가면 막히고, 벽 끝이 경계에 딱 걸리면 된다", async ({
    page,
    isMobile,
  }) => {
    await drawWall(page, { x: 500, y: 0 }, { x: 500, y: 200 }, isMobile);
    await resize(page, "6.0 × 4.5", "4.0", "4.5");
    await expect(dialog(page).getByRole("alert")).toHaveText(OUTSIDE);
    await dialog(page).getByLabel("가로 (m)").fill("5.0");
    await dialog(page).getByRole("button", { name: "바꾸기" }).click();
    await expect(sizeButton(page, "5.0 × 4.5")).toBeVisible();
  });

  test("엣지: 줄여서 가구가 바닥 밖으로 나가도 막힌다", async ({ page, isMobile }) => {
    await placeBox(page, { x: 450, y: 50 }, { x: 550, y: 150 }, isMobile);
    // 휴대폰은 고른 가구의 속성 패널이 아래 막대(바닥 크기 버튼)를 가려서 다른 도구로 바꿔 풀어 둔다
    await chooseTool(page, "직선");
    await resize(page, "6.0 × 4.5", "5.0", "4.5");
    await expect(dialog(page).getByRole("alert")).toHaveText(OUTSIDE);
  });

  test("엣지: 범위 밖·숫자 아님·빈 칸은 칸 아래에 까닭이 뜨고 바뀌지 않는다", async ({ page }) => {
    const cases: [width: string, message: string][] = [
      ["0.5", "1m 이상으로 적어 주세요"],
      ["31", "30m 이하로 적어 주세요"],
      ["abc", "숫자로 적어 주세요 (예: 6.0)"],
      ["", "크기를 적어 주세요"],
    ];
    await sizeButton(page, "6.0 × 4.5").click();
    for (const [width, message] of cases) {
      await dialog(page).getByLabel("가로 (m)").fill(width);
      await dialog(page).getByRole("button", { name: "바꾸기" }).click();
      await expect(dialog(page).getByLabel("가로 (m)"), width).toHaveAccessibleDescription(message);
    }
    await dialog(page).getByRole("button", { name: "취소" }).click();
    await expect(sizeButton(page, "6.0 × 4.5")).toBeVisible();
  });

  test("엣지: Esc·취소면 바뀌지 않고 닫히며 초점은 버튼으로 돌아온다", async ({
    page,
    isMobile,
  }) => {
    await sizeButton(page, "6.0 × 4.5").click();
    await dialog(page).getByLabel("가로 (m)").fill("9");
    if (isMobile) await dialog(page).getByRole("button", { name: "취소" }).click();
    else await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(sizeButton(page, "6.0 × 4.5")).toBeFocused();
  });

  test("엣지: 360px에서 대화상자가 화면 안이다", async ({ page, isMobile }, testInfo) => {
    test.skip(!isMobile, "휴대폰 화면에서만");
    await sizeButton(page, "6.0 × 4.5").click();
    const box = await dialog(page).boundingBox();
    const width = page.viewportSize()?.width ?? 0;
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath("floor-resize.png"), fullPage: true });
  });
});
