import { expect, test, type Page } from "@playwright/test";
import { chooseTool, cmToScreen, createSpace, plan, pressCm, wallPoints } from "./helpers";

const FLOOR = { w: 600, h: 450 };
const ACCENT = "rgb(168, 80, 27)"; // --yg-accent

function snapSwitch(page: Page) {
  return page.getByRole("switch", { name: "격자 스냅" });
}

test.describe("격자 스냅 토글", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("2D 평면도 아래에 있고 처음에는 켜져 있다", async ({ page }) => {
    await expect(snapSwitch(page)).toHaveAttribute("aria-checked", "true");
    const area = await page.getByRole("region", { name: "2D 평면도 영역" }).boundingBox();
    const toggle = await snapSwitch(page).boundingBox();
    if (!area || !toggle) throw new Error("영역이나 토글이 없다");
    expect(toggle.y).toBeGreaterThan(area.y + area.height / 2);
    expect(toggle.height).toBeGreaterThanOrEqual(44); // 터치 영역
    await expect(snapSwitch(page).locator("span").nth(1)).toHaveCSS("background-color", ACCENT);
  });

  test("끄면 누른 자리 그대로(1cm) 찍히고, 다시 켜면 격자에 붙는다", async ({ page, isMobile }) => {
    await snapSwitch(page).click();
    await expect(snapSwitch(page)).toHaveAttribute("aria-checked", "false");
    await chooseTool(page, "직선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 123, y: 207 },
        { x: 348, y: 207 },
      ],
      isMobile,
    );
    const off = (await wallPoints(page))[0];
    expect(Math.abs((off?.[0]?.[0] ?? 0) - 123)).toBeLessThanOrEqual(1);
    expect((off?.[0]?.[0] ?? 0) % 10).not.toBe(0);

    await snapSwitch(page).click();
    await chooseTool(page, "직선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 123, y: 307 },
        { x: 348, y: 307 },
      ],
      isMobile,
    );
    expect((await wallPoints(page))[1]?.[0]).toEqual([120, 310]);
  });

  test("끄면 붙을 곳 표시가 사라진다", async ({ page, isMobile }) => {
    test.skip(isMobile, "커서(마우스 올림)는 데스크톱에서만");
    await chooseTool(page, "직선");
    const at = await cmToScreen(page, FLOOR, { x: 200, y: 200 });
    await page.mouse.move(at.x, at.y);
    await expect(plan(page).getByTestId("snap-grid")).toHaveCount(1);
    await snapSwitch(page).click();
    await page.mouse.move(at.x + 3, at.y);
    await expect(plan(page).getByTestId("snap-grid")).toHaveCount(0);
    await expect(plan(page).getByTestId("snap-endpoint")).toHaveCount(0);
  });

  test("키보드 Space로도 바꿀 수 있다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await snapSwitch(page).focus();
    await page.keyboard.press(" ");
    await expect(snapSwitch(page)).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press(" ");
    await expect(snapSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  test("엣지: 그리는 중에 꺼도 그리던 점은 남는다", async ({ page, isMobile }) => {
    await chooseTool(page, "연속선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
      ],
      isMobile,
    );
    await snapSwitch(page).click();
    await expect(plan(page).getByTestId("draft")).toHaveCount(1);
    await pressCm(
      page,
      FLOOR,
      [
        { x: 300, y: 300 },
        { x: 300, y: 300 },
      ],
      isMobile,
    );
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expect(walls[0]?.slice(0, 2)).toEqual([
      [100, 100],
      [300, 100],
    ]);
  });
});
