import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, dragFloorCm, plan, pressCm } from "./helpers";

const FLOOR = { w: 600, h: 450 };
const DANGER = "rgb(155, 44, 31)"; // --yg-danger
type Cm = { x: number; y: number };

const notice = (page: Page) =>
  page.getByRole("region", { name: "2D 평면도 영역" }).getByRole("status");
const panel = (page: Page) => page.getByRole("complementary", { name: "속성 패널" });
const firstBox = (page: Page) => plan(page).getByTestId("box").first();

/** 직선 도구로 벽 하나를 긋는다 (두 점을 차례로 누른다). */
async function drawWall(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "직선");
  await pressCm(page, FLOOR, [from, to], isMobile);
  await chooseTool(page, "선택");
}

/** 가구 도구로 끈다 (놓이면 그 가구가 골라지고 선택 도구가 된다). */
async function placeBox(
  page: Page,
  from: Cm,
  to: Cm,
  isMobile: boolean,
  beforeUp?: () => Promise<void>,
) {
  await chooseTool(page, "가구");
  await dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);
}

test.describe("겹치는 자리에 가구 놓기 막기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await drawWall(page, { x: 300, y: 0 }, { x: 300, y: 450 }, isMobile); // 벽 면: x 294 · 306
    await placeBox(page, { x: 100, y: 100 }, { x: 200, y: 200 }, isMobile); // 보관함 1
  });

  test("겹치게 끌면 미리보기가 삭제색이고, 떼도 놓이지 않으며 안내가 잠깐 뜬다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await placeBox(page, { x: 250, y: 100 }, { x: 350, y: 200 }, isMobile, async () => {
      const draft = plan(page).getByTestId("box-draft");
      await expect(draft).toHaveAttribute("data-blocked", "true");
      await expect(draft).toHaveCSS("stroke", DANGER);
    });
    await expect(plan(page)).toHaveAccessibleName(/가구 1개$/);
    await expect(notice(page)).toHaveText("벽이나 다른 가구와 겹치는 자리예요");
    await expect(notice(page)).toBeHidden({ timeout: 5000 }); // 2.5초 뒤 사라진다
    expect(errors).toEqual([]);
  });

  test("누르기만 해서 다른 가구 위에 놓으려 해도 놓이지 않는다", async ({ page, isMobile }) => {
    await chooseTool(page, "가구");
    await pressCm(page, FLOOR, [{ x: 150, y: 150 }], isMobile);
    await expect(plan(page)).toHaveAccessibleName(/가구 1개$/);
    await expect(notice(page)).toHaveText("벽이나 다른 가구와 겹치는 자리예요");
  });

  test("엣지: 맞닿는 자리(다른 가구 면에 붙여)에는 놓인다", async ({ page, isMobile }) => {
    await placeBox(page, { x: 200, y: 100 }, { x: 290, y: 200 }, isMobile, async () => {
      await expect(plan(page).getByTestId("box-draft")).toHaveAttribute("data-blocked", "false");
    });
    await expect(plan(page)).toHaveAccessibleName(/가구 2개$/);
    await expect(notice(page)).toBeHidden();
  });

  test("엣지: 벽을 가구 위로 그으면 겹친 가구를 알리고, 빼내면 사라지며, 되돌리면 다시 알린다", async ({
    page,
    isMobile,
  }) => {
    await drawWall(page, { x: 150, y: 50 }, { x: 150, y: 300 }, isMobile); // 보관함 1 한가운데로
    await expect(firstBox(page)).toHaveAttribute("data-look", "overlapping");
    await expect(firstBox(page).locator("rect")).toHaveCSS("stroke", DANGER);
    await pressCm(page, FLOOR, [{ x: 120, y: 150 }], isMobile);
    await expect(panel(page).getByText("벽이나 다른 가구와 겹쳐 있어요")).toBeVisible();
    await dragFloorCm(page, FLOOR, { x: 120, y: 150 }, { x: 20, y: 150 }, isMobile); // 왼쪽으로 빼낸다
    await expect(panel(page).getByText("벽이나 다른 가구와 겹쳐 있어요")).toHaveCount(0);
    await pressCm(page, FLOOR, [{ x: 450, y: 400 }], isMobile); // 풀어서 보통 모양을 본다
    await expect(firstBox(page)).toHaveAttribute("data-look", "normal");
    await page.getByRole("button", { name: "되돌리기" }).click(); // 빼내기 전으로
    await expect(firstBox(page)).toHaveAttribute("data-look", "overlapping");
  });

  test("엣지: 휴대폰에서도 안내가 화면 안이다", async ({ page, isMobile }, testInfo) => {
    await chooseTool(page, "가구");
    await pressCm(page, FLOOR, [{ x: 150, y: 150 }], isMobile);
    const box = await notice(page).boundingBox();
    const width = page.viewportSize()?.width ?? 0;
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath("place-blocked.png"), fullPage: true });
  });
});
