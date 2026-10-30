import { expect, test, type Page } from "@playwright/test";
import {
  chooseTool,
  collectErrors,
  createSpace,
  dragFloorCm,
  expectNear,
  plan,
  pressCm,
  wallPoints,
} from "./helpers";
import { FLOOR, placeBox } from "./boxes";

const DANGER = "rgb(155, 44, 31)"; // --yg-danger
const MESSAGE = "가구와 겹치는 자리에는 벽을 그을 수 없어요";

const notice = (page: Page) =>
  page.getByRole("region", { name: "2D 평면도 영역" }).getByRole("status");
const draft = (page: Page) => plan(page).getByTestId("draft");

test.describe("가구를 지나가는 벽 긋기 막기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    // 보관함 1: x 100 ~ 200, y 100 ~ 200 (놓으면 선택 도구가 된다)
    await placeBox(page, { x: 100, y: 100 }, { x: 200, y: 200 }, isMobile);
  });

  test("직선: 가구를 지나가게 둘째 점을 누르면 그어지지 않고 안내가 뜨며, 첫 점은 남는다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await chooseTool(page, "직선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 150, y: 50 },
        { x: 150, y: 300 },
      ],
      isMobile,
    );
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(notice(page)).toHaveText(MESSAGE);
    await pressCm(page, FLOOR, [{ x: 300, y: 50 }], isMobile); // 첫 점에서 가구 위쪽으로 비켜 간다
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expectNear(walls[0], [
      { x: 150, y: 50 },
      { x: 300, y: 50 },
    ]);
    await expect(notice(page)).toBeHidden({ timeout: 5000 }); // 2.5초 뒤 사라진다
    expect(errors).toEqual([]);
  });

  test("엣지: 직선을 끌어 가구를 지나가면 미리보기가 삭제색이고, 떼도 그어지지 않는다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "직선");
    await dragFloorCm(page, FLOOR, { x: 50, y: 150 }, { x: 300, y: 150 }, isMobile, async () => {
      await expect(draft(page)).toHaveAttribute("data-blocked", "true");
      await expect(draft(page)).toHaveCSS("stroke", DANGER);
    });
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(notice(page)).toHaveText(MESSAGE);
  });

  test("엣지: 가구 바로 옆(벽 면과 4cm)은 미리보기가 보통 색이고 그어진다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "직선");
    await dragFloorCm(page, FLOOR, { x: 50, y: 90 }, { x: 300, y: 90 }, isMobile, async () => {
      await expect(draft(page)).toHaveAttribute("data-blocked", "false");
    });
    expect(await wallPoints(page)).toHaveLength(1);
    await expect(notice(page)).toBeHidden();
  });

  test("연속선: 가구를 지나가는 점은 찍히지 않고, 비켜 가면 이어서 그린다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "연속선");
    await pressCm(
      page,
      FLOOR,
      [
        { x: 50, y: 50 },
        { x: 250, y: 50 },
        { x: 50, y: 250 },
      ],
      isMobile,
    );
    await expect(notice(page)).toHaveText(MESSAGE);
    // 마지막 점을 한 번 더 누르면 끝낸다
    await pressCm(
      page,
      FLOOR,
      [
        { x: 250, y: 300 },
        { x: 250, y: 300 },
      ],
      isMobile,
    );
    const walls = await wallPoints(page);
    expect(walls).toHaveLength(1);
    expectNear(walls[0], [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 300 },
    ]);
  });

  test("엣지: 연속선을 첫 점에서 닫을 때 닫는 선분이 가구를 지나가면 닫히지 않는다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "연속선");
    const points = [
      { x: 50, y: 250 },
      { x: 50, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 50 },
      { x: 50, y: 250 }, // 첫 점: (300, 50) → (50, 250)이 가구를 비스듬히 지난다
    ];
    await pressCm(page, FLOOR, points, isMobile);
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(notice(page)).toHaveText(MESSAGE);
  });

  test("사각형: 가구를 지나가게 끌면 미리보기가 삭제색이고, 떼도 그어지지 않는다", async ({
    page,
    isMobile,
  }, testInfo) => {
    await chooseTool(page, "사각형");
    await dragFloorCm(page, FLOOR, { x: 150, y: 50 }, { x: 400, y: 300 }, isMobile, async () => {
      await expect(draft(page)).toHaveAttribute("data-blocked", "true");
      await page.screenshot({ path: testInfo.outputPath("wall-blocked.png"), fullPage: true });
    });
    expect(await wallPoints(page)).toHaveLength(0);
    await expect(notice(page)).toHaveText(MESSAGE);
    await expect(plan(page)).toHaveAccessibleName(/벽 0개, .*가구 1개$/);
  });

  test("엣지: 가구를 둘러싼 사각형은 그어진다", async ({ page, isMobile }) => {
    await chooseTool(page, "사각형");
    await dragFloorCm(page, FLOOR, { x: 50, y: 50 }, { x: 250, y: 250 }, isMobile);
    expect(await wallPoints(page)).toHaveLength(1);
    await expect(notice(page)).toBeHidden();
  });
});
