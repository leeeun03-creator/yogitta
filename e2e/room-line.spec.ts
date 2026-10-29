import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  cmToScreen,
  collectErrors,
  createSpace,
  dragPath,
  openPreview,
  plan,
  preview,
  pressCm,
} from "./helpers";
import { roomLinePoints } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const LABEL_LINE_PX = 20; // 도구 이름(12px) 한 줄 높이
type Cm = { x: number; y: number };

/** 바닥 좌표(cm) 경로를 따라 끈다. */
async function dragCm(page: Page, path: Cm[], isMobile: boolean, beforeUp?: () => Promise<void>) {
  const screen = await Promise.all(path.map((point) => cmToScreen(page, FLOOR, point)));
  await dragPath(page, screen, isMobile, beforeUp);
}

/** 점 [x, y]가 기대한 점과 tolerance(cm) 안인지 본다 (자유 곡선이라 화면 px 반올림 오차가 있다). */
function expectPoint(actual: number[] | undefined, expected: Cm, tolerance = 2) {
  expect(Math.abs((actual?.[0] ?? NaN) - expected.x)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs((actual?.[1] ?? NaN) - expected.y)).toBeLessThanOrEqual(tolerance);
}

const CURVE = [
  { x: 300, y: 15 },
  { x: 340, y: 150 },
  { x: 270, y: 300 },
  { x: 300, y: 435 },
];

test.describe("구역 선 도구", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "구역 선");
  });

  test("끌면 손 가는 대로 구역 선이 생기고, 끝은 가까운 바닥 테두리에 붙는다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await dragCm(page, CURVE, isMobile);
    const lines = await roomLinePoints(page);
    expect(lines).toHaveLength(1);
    const points = lines[0] ?? [];
    expect(points.length).toBeGreaterThan(CURVE.length); // 곡선 그대로 (점 4개로 줄지 않음)
    expectPoint(points[0], { x: 300, y: 0 }); // 15cm → 위 테두리
    expectPoint(points[points.length - 1], { x: 300, y: 450 }); // 15cm → 아래 테두리
    await expect(plan(page)).toHaveAccessibleName(/벽 0개, 구역 선 1개$/);
    await expect(plan(page).getByTestId("room-line-draft")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("되돌리기·다시하기가 된다", async ({ page, isMobile }) => {
    await dragCm(page, CURVE, isMobile);
    await page.getByRole("button", { name: "되돌리기" }).click();
    expect(await roomLinePoints(page)).toHaveLength(0);
    await page.getByRole("button", { name: "다시하기" }).click();
    expect(await roomLinePoints(page)).toHaveLength(1);
  });

  test("끝이 벽에서 30cm 안이면 벽 위로 붙는다", async ({ page, isMobile }) => {
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
    await chooseTool(page, "구역 선");
    await dragCm(
      page,
      [
        { x: 250, y: 125 },
        { x: 255, y: 300 },
        { x: 250, y: 400 },
      ],
      isMobile,
    );
    const points = (await roomLinePoints(page))[0] ?? [];
    expectPoint(points[0], { x: 250, y: 100 });
    expectPoint(points[points.length - 1], { x: 250, y: 400 }); // 테두리에서 50cm라 그대로
  });

  test("지우개로 누르면 구역 선이 통째로 지워진다", async ({ page, isMobile }) => {
    await dragCm(
      page,
      [
        { x: 300, y: 15 },
        { x: 300, y: 435 },
      ],
      isMobile,
    );
    await chooseTool(page, "지우개");
    if (!isMobile) {
      const at = await cmToScreen(page, FLOOR, { x: 300, y: 225 });
      await page.mouse.move(at.x, at.y);
      await expect(plan(page).getByTestId("erasing")).toHaveCount(1);
    }
    await pressCm(page, FLOOR, [{ x: 300, y: 225 }], isMobile);
    expect(await roomLinePoints(page)).toHaveLength(0);
    await page.getByRole("button", { name: "되돌리기" }).click();
    expect(await roomLinePoints(page)).toHaveLength(1);
  });

  test("엣지: 20cm보다 짧게 끈 선은 더하지 않는다", async ({ page, isMobile }) => {
    await dragCm(
      page,
      [
        { x: 300, y: 200 },
        { x: 310, y: 205 },
      ],
      isMobile,
    );
    expect(await roomLinePoints(page)).toHaveLength(0);
  });

  test("엣지: 바닥 밖으로 끌면 바닥 경계까지만 그린다", async ({ page, isMobile }) => {
    const start = await cmToScreen(page, FLOOR, { x: 300, y: 200 });
    const outside = await cmToScreen(page, FLOOR, { x: 300, y: 520 });
    await dragPath(page, [start, outside], isMobile);
    const points = (await roomLinePoints(page))[0] ?? [];
    expect(Math.max(...points.map(([, y]) => y ?? 0))).toBe(450);
  });

  test("엣지: 끄는 중에 Esc를 누르면 그리던 선을 버린다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await plan(page).focus();
    await dragCm(page, CURVE, false, async () => {
      await expect(plan(page).getByTestId("room-line-draft")).toHaveCount(1);
      await page.keyboard.press("Escape");
    });
    expect(await roomLinePoints(page)).toHaveLength(0);
  });

  test("엣지: 터치로 끄는 동안 돋보기가 뜬다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "터치는 모바일에서만");
    await dragCm(page, CURVE, true, async () => {
      await expect(page.getByTestId("loupe")).toBeVisible();
    });
    await expect(page.getByTestId("loupe")).toHaveCount(0);
    expect(await roomLinePoints(page)).toHaveLength(1);
  });

  test("엣지: 구역 선은 3D 미리보기에 서지 않는다", async ({ page, isMobile }) => {
    await dragCm(page, CURVE, isMobile);
    await openPreview(page);
    await expect(preview(page)).toHaveAccessibleName(
      "3D 미리보기, 바닥 6.0 × 4.5 m, 벽 0개, 선분 0개, 구역 0개",
    );
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

  test("엣지: 도구 6개가 360px에서도 막대 안에 한 줄로 들어가고 44px이다", async ({ page }) => {
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

  test("스크린샷을 남긴다", async ({ page, isMobile }, testInfo) => {
    await chooseTool(page, "사각형");
    const rect = [
      { x: 60, y: 60 },
      { x: 540, y: 390 },
    ];
    const [a, b] = await Promise.all(rect.map((point) => cmToScreen(page, FLOOR, point)));
    if (a && b) await dragPath(page, [a, b], isMobile);
    await chooseTool(page, "구역 선");
    await dragCm(
      page,
      [
        { x: 320, y: 75 },
        { x: 360, y: 200 },
        { x: 300, y: 300 },
        { x: 320, y: 375 },
      ],
      isMobile,
    );
    await page.screenshot({ path: testInfo.outputPath("room-line.png"), fullPage: true });
  });
});
