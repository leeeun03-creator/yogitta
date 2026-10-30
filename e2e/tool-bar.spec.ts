import { expect, test, type Page } from "@playwright/test";
import { createSpace } from "./helpers";

const TOOLS = ["선택", "직선", "연속선", "사각형", "구역 선", "가구", "지우개"];
const ACCENT = "rgb(168, 80, 27)"; // --yg-accent #A8501B
const LABEL_LINE_PX = 20; // 도구 이름(12px) 한 줄 높이

function toolBar(page: Page) {
  return page.getByRole("toolbar", { name: "그리기 도구" });
}
function tool(page: Page, name: string) {
  return toolBar(page).getByRole("button", { name, exact: true });
}
async function pressedTools(page: Page) {
  const pressed: string[] = [];
  for (const name of TOOLS) {
    if ((await tool(page, name).getAttribute("aria-pressed")) === "true") pressed.push(name);
  }
  return pressed;
}

test.describe("그리기 도구 막대", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("도구 7개가 있고 처음에는 선택 도구다", async ({ page }) => {
    for (const name of TOOLS) await expect(tool(page, name)).toBeVisible();
    expect(await pressedTools(page)).toEqual(["선택"]);
    await expect(tool(page, "선택")).toHaveCSS("background-color", ACCENT);
  });

  test("누른 도구 하나만 선택된다", async ({ page }) => {
    for (const name of TOOLS) {
      await tool(page, name).click();
      expect(await pressedTools(page)).toEqual([name]);
    }
  });

  test("엣지: 누른 도구 위에 마우스·손가락이 있어도 강조색 바탕이다", async ({ page }) => {
    await tool(page, "직선").click(); // 누른 뒤 포인터는 버튼 위에 남아 있다
    await expect(tool(page, "직선")).toHaveCSS("background-color", ACCENT);
    await tool(page, "직선").hover();
    await expect(tool(page, "직선")).toHaveCSS("background-color", ACCENT);
  });

  test("키보드 Tab·Enter로도 고를 수 있다", async ({ page, isMobile }) => {
    test.skip(isMobile, "모바일에는 키보드 Tab 이동이 없다");
    await tool(page, "선택").focus();
    await page.keyboard.press("Tab");
    await expect(tool(page, "직선")).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await pressedTools(page)).toEqual(["직선"]);
  });

  test("넓은 화면에서는 2D 평면도 왼쪽에 세로로 놓인다", async ({ page, isMobile }) => {
    test.skip(isMobile, "좁은 화면은 다음 테스트");
    const bar = await toolBar(page).boundingBox();
    const plan = await page.getByRole("region", { name: "2D 평면도 영역" }).boundingBox();
    expect(bar && plan).toBeTruthy();
    if (!bar || !plan) return;
    expect(bar.x + bar.width).toBeLessThanOrEqual(plan.x);
    expect(bar.height).toBeGreaterThan(bar.width);
  });

  test("엣지: 360px 화면에서는 2D 평면도 위에 가로로 놓이고 가로 스크롤이 없다", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "좁은 화면에서만");
    const bar = await toolBar(page).boundingBox();
    const plan = await page.getByRole("region", { name: "2D 평면도 영역" }).boundingBox();
    if (!bar || !plan) throw new Error("도구 막대나 2D 평면도가 없다");
    expect(bar.y + bar.height).toBeLessThanOrEqual(plan.y);
    expect(bar.width).toBeGreaterThan(bar.height);
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewportWidth,
    );
    for (const name of TOOLS) {
      const box = await tool(page, name).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44); // 터치 영역
    }
  });

  test("스크린샷을 남긴다 (시안 04·08과 비교)", async ({ page }, testInfo) => {
    await tool(page, "직선").click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath("tool-bar.png"), fullPage: true });
  });

  test("엣지: 키보드로 구역 선 도구를 고른다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    const bar = page.getByRole("toolbar", { name: "그리기 도구" });
    await bar.getByRole("button", { name: "사각형" }).focus();
    await page.keyboard.press("Tab");
    await expect(bar.getByRole("button", { name: "구역 선" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(bar.getByRole("button", { name: "구역 선" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("엣지: 도구 7개가 360px에서도 막대 안에 한 줄로 들어가고 44px이다", async ({ page }) => {
    const bar = page.getByRole("toolbar", { name: "그리기 도구" });
    const barBox = await bar.boundingBox();
    for (const button of await bar.getByRole("button").all()) {
      const box = await button.boundingBox();
      const label = await button.locator("span").boundingBox();
      expect(label?.height).toBeLessThanOrEqual(LABEL_LINE_PX); // 글자가 두 줄로 꺾이지 않는다
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        (barBox?.x ?? 0) + (barBox?.width ?? 0),
      );
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
});
