import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, plan } from "./helpers";
import { dragCm, makeRoom, roomLabels, roomLinePoints } from "./rooms";

type Cm = { x: number; y: number };

/** 구역 선 도구로 path를 긋고 선택 도구로 돌아온다. */
async function drawRoomLine(page: Page, path: Cm[], isMobile: boolean) {
  await chooseTool(page, "구역 선");
  await dragCm(page, path, isMobile);
  await chooseTool(page, "선택");
}

test.describe("벽에 닿지 않게 그은 구역 선", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("두 끝이 테두리에서 1m씩 떨어져도 늘어나 닿고, 양쪽을 다른 구역으로 만들 수 있다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    const path = [
      { x: 300, y: 100 },
      { x: 300, y: 350 },
    ];
    await drawRoomLine(page, path, isMobile);
    const points = (await roomLinePoints(page))[0] ?? [];
    expect(points[0]?.[1]).toBeCloseTo(0, 0);
    expect(points[points.length - 1]?.[1]).toBeCloseTo(450, 0);
    await expect(plan(page).getByTestId("room-line-end")).toHaveCount(2); // 닿은 끝 표시
    await makeRoom(page, "안방", { x: 150, y: 200 }, isMobile);
    await makeRoom(page, "거실", { x: 450, y: 200 }, isMobile);
    await expect(roomLabels(page)).toHaveText(["안방", "거실"]);
    expect(errors).toEqual([]);
  });

  test("엣지: 한쪽 끝만 떠 있어도 바닥이 나뉜다", async ({ page, isMobile }) => {
    const path = [
      { x: 300, y: 15 },
      { x: 300, y: 300 },
    ];
    await drawRoomLine(page, path, isMobile);
    await makeRoom(page, "안방", { x: 150, y: 200 }, isMobile);
    await makeRoom(page, "거실", { x: 450, y: 200 }, isMobile);
    await expect(roomLabels(page)).toHaveText(["안방", "거실"]);
  });

  test("엣지: 바닥 가운데 고리로 그으면 고리 안쪽이 구획이 된다", async ({ page, isMobile }) => {
    const loop = [
      { x: 200, y: 150 },
      { x: 400, y: 150 },
      { x: 400, y: 300 },
      { x: 200, y: 300 },
      { x: 205, y: 160 },
    ];
    await drawRoomLine(page, loop, isMobile);
    await makeRoom(page, "옷방", { x: 300, y: 225 }, isMobile);
    await makeRoom(page, "거실", { x: 50, y: 50 }, isMobile);
    await expect(roomLabels(page)).toHaveText(["옷방", "거실"]);
  });
});
