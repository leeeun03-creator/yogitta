import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, pressCm } from "./helpers";
import { dragCm, makeRoom, splitAt } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const LONG_NAME = "할머니댁 이층 끝 작은 방 옆 다용도실 창고";

const space3D = (page: Page) => page.getByRole("img", { name: /^3D 공간,/ });
const mainTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "요깃따" });
const viewButton = (page: Page, name: "처음 보기" | "확대") =>
  page.getByRole("group", { name: "3D 보기" }).getByRole("button", { name });
const nameWith = (walls: number, segments: number, rooms: number) =>
  `3D 공간, 바닥 6.0 × 4.5 m, 벽 ${walls}개, 선분 ${segments}개, 구역 ${rooms}개, 가구 0개`;

/** 편집 모드에서 [‹ 완료]를 눌러 메인 화면으로 간다. */
async function finishEditing(page: Page) {
  await page.getByRole("button", { name: "완료" }).click();
  await expect(mainTitle(page)).toBeVisible();
}

/** 직선 도구로 가로 벽 하나를 긋는다. */
async function drawWall(page: Page, y: number, isMobile: boolean) {
  await chooseTool(page, "직선");
  const ends = [
    { x: 100, y },
    { x: 500, y },
  ];
  await pressCm(page, FLOOR, ends, isMobile);
}

test.describe("메인 화면 머리와 3D 공간", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("머리에 로고·공간 이름·[편집]이 있고, 그린 벽이 3D 공간에 선다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await drawWall(page, 100, isMobile);
    await finishEditing(page);
    const header = page.getByRole("banner");
    await expect(header.getByText("공간", { exact: true })).toBeVisible();
    await expect(header.getByText("내 방", { exact: true })).toBeVisible();
    await expect(header.getByRole("button", { name: "편집" })).toBeVisible();
    await expect(space3D(page)).toHaveAccessibleName(nameWith(1, 1, 0));
    expect(errors).toEqual([]);
  });

  test("시점·줌 버튼: 확대하면 처음 보기가 켜지고, 누르면 처음 자리로 온다", async ({ page }) => {
    await finishEditing(page);
    await expect(viewButton(page, "처음 보기")).toBeDisabled();
    await viewButton(page, "확대").click();
    await expect(viewButton(page, "처음 보기")).toBeEnabled();
    await viewButton(page, "처음 보기").click();
    await expect(viewButton(page, "처음 보기")).toBeDisabled();
  });

  test("엣지: 벽 없는 공간도 바닥만 보인다", async ({ page }) => {
    await finishEditing(page);
    await expect(space3D(page)).toHaveAccessibleName(nameWith(0, 0, 0));
  });

  test("엣지: 구역을 만들고 오면 구역 색이 깔린다", async ({ page, isMobile }) => {
    await splitAt(page, [300], isMobile);
    await makeRoom(page, "안방", { x: 150, y: 200 }, isMobile);
    await finishEditing(page);
    await expect(space3D(page)).toHaveAccessibleName(nameWith(0, 0, 1));
  });

  test("엣지: 편집 모드에서 더 그리고 오면 3D 공간에도 더해진다", async ({ page, isMobile }) => {
    await drawWall(page, 100, isMobile);
    await finishEditing(page);
    await page.getByRole("button", { name: "편집" }).click();
    await drawWall(page, 300, isMobile);
    await finishEditing(page);
    await expect(space3D(page)).toHaveAccessibleName(nameWith(2, 2, 0));
  });

  test("스크린샷을 남긴다 (시안 01과 비교)", async ({ page, isMobile }, testInfo) => {
    await chooseTool(page, "사각형");
    await dragCm(
      page,
      [
        { x: 0, y: 0 },
        { x: 600, y: 450 },
      ],
      isMobile,
    );
    await drawWall(page, 250, isMobile);
    await finishEditing(page);
    await expect(space3D(page)).toHaveAccessibleName(nameWith(2, 5, 0));
    await page.waitForTimeout(500); // 첫 장면이 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("main-screen.png"), fullPage: true });
  });
});

test.describe("메인 화면 엣지", () => {
  test("엣지: 공간 이름이 길어도 머리가 넘치지 않고 [편집]이 보인다", async ({ page }) => {
    await page.goto("./");
    await page.getByLabel("공간 이름").fill(LONG_NAME);
    await page.getByLabel("가로 (m)").fill("6.0");
    await page.getByLabel("세로 (m)").fill("4.5");
    await page.getByRole("button", { name: "벽 그리러 가기" }).click();
    await finishEditing(page);
    const edit = await page.getByRole("button", { name: "편집" }).boundingBox();
    const viewport = page.viewportSize()?.width ?? 0;
    expect((edit?.x ?? 0) + (edit?.width ?? 0)).toBeLessThanOrEqual(viewport);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(viewport);
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
    await finishEditing(page);
    // 화면 아래 저장 안내 자리도 status라 3D 공간 영역 안에서 찾는다
    await expect(page.getByRole("region", { name: "3D 공간 영역" }).getByRole("status")).toHaveText(
      "이 브라우저에서는 3D를 볼 수 없어요. [편집]을 누르면 2D 평면도로 볼 수 있어요.",
    );
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
