import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/** 페이지에서 난 콘솔 에러와 처리 안 된 예외를 모은다. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("첫 화면", () => {
  test("로고가 보이고 콘솔 에러가 없다", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("./");

    await expect(page).toHaveTitle("요깃따");
    await expect(page.getByRole("heading", { name: "요깃따" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("제목은 Jua, 본문은 Gowun Dodum 글꼴이 적용된다", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() => document.fonts.ready);

    const heading = page.getByRole("heading", { name: "요깃따" });
    await expect(heading).toHaveCSS("font-family", /Jua/);
    await expect(page.locator("body")).toHaveCSS("font-family", /Gowun Dodum/);
    expect(await page.evaluate(() => document.fonts.check('16px "Jua"', "요깃따"))).toBe(true);
  });

  test("바탕색이 디자인 토큰 --yg-bg 다", async ({ page }) => {
    await page.goto("./");
    // #F4ECDF
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 236, 223)");
  });

  test("디자인 토큰이 yogitta-design 1장 값과 같다", async ({ page }) => {
    const skill = readFileSync(".claude/skills/yogitta-design/SKILL.md", "utf-8");
    const cssBlock = skill.slice(
      skill.indexOf("```css"),
      skill.indexOf("```", skill.indexOf("```css") + 6),
    );
    const expected = Object.fromEntries(
      [...cssBlock.matchAll(/(--yg-[\w-]+):\s*([^;]+);/g)].map(
        ([, name = "", value = ""]): [string, string] => [name, value.trim()],
      ),
    );
    await page.goto("./");
    // 빌드가 rgba(…)를 #rrggbbaa로 줄이는 등 표기가 달라질 수 있어서, 두 값을 같은 속성에 적용한 계산 결과로 비교한다.
    const compared = await page.evaluate((tokens) => {
      const probe = document.createElement("div");
      document.body.append(probe);
      const result = Object.entries(tokens).map(([name, value]) => {
        const property = name.includes("shadow")
          ? "box-shadow"
          : name.includes("radius")
            ? "border-radius"
            : "color";
        probe.style.setProperty(property, value);
        const fromSkill = getComputedStyle(probe).getPropertyValue(property);
        probe.style.setProperty(property, `var(${name})`);
        const fromApp = getComputedStyle(probe).getPropertyValue(property);
        return { name, fromSkill, fromApp };
      });
      probe.remove();
      return result;
    }, expected);

    expect(compared.length).toBeGreaterThan(0);
    for (const { name, fromSkill, fromApp } of compared) {
      expect(fromApp, name).toBe(fromSkill);
    }
  });

  test("가로 스크롤이 생기지 않는다", async ({ page }) => {
    await page.goto("./");
    // 설정한 화면 폭과 비교해서, 실패하면 몇 px로 넘쳤는지 바로 보이게 한다.
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(contentWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("화면을 스크린샷으로 남긴다", async ({ page }, testInfo) => {
    await page.goto("./");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath("first-screen.png"), fullPage: true });
  });
});

test.describe("엣지 케이스", () => {
  test("글꼴 서버가 막혀도 화면은 뜬다", async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "요깃따" })).toBeVisible();
  });
});
