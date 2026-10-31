import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, dragFloorCm, openPreview } from "./helpers";
import { FLOOR, drawWall, expectBox, placeBox } from "./boxes";
import { chooseType, savedBoxes } from "./stack";

/** 저장된 벽걸이 1의 [가운데 x, 가운데 y, 회전]. */
const savedShelf = async (page: Page) => {
  const shelf = (await savedBoxes(page)).find((box) => box.name === "벽걸이 1");
  return [shelf?.x, shelf?.z, shelf?.rotation];
};

test.describe("벽걸이를 가까운 벽에 붙이기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  // 세로 벽 x = 300 (벽 면 294), 벽걸이 1: 가운데 (130, 70), 60 × 40
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await drawWall(page, { x: 300, y: 0 }, { x: 300, y: 450 }, isMobile);
    await placeBox(page, { x: 100, y: 50 }, { x: 160, y: 90 }, isMobile);
    await chooseType(page, "벽걸이");
  });

  test("벽 가까이 끌면 뒷면이 벽 면에 붙고 정면이 벽 반대쪽(90도)을 보며, 끄는 동안에도 붙어 보인다", async ({
    page,
    isMobile,
  }, testInfo) => {
    const errors = collectErrors(page);
    // 끈 자리 가운데 270 (격자): 뒷면에서 벽 면까지 4cm → 벽 가운데선 300 - 6 - 깊이 절반 20 = 274
    await dragFloorCm(page, FLOOR, { x: 130, y: 70 }, { x: 265, y: 70 }, isMobile, () =>
      expectBox(page, [274, 70, 60, 40, 90]),
    );
    await expect.poll(() => savedShelf(page)).toEqual([274, 70, 90]);
    await openPreview(page);
    await page.screenshot({ path: testInfo.outputPath("mounted-3d.png") });
    expect(errors).toEqual([]);
  });

  test("엣지: 벽에서 멀면 붙이지 않고 방향도 그대로다", async ({ page, isMobile }) => {
    await dragFloorCm(page, FLOOR, { x: 130, y: 70 }, { x: 200, y: 70 }, isMobile);
    await expect.poll(() => savedShelf(page)).toEqual([200, 70, 0]);
  });

  test("엣지: 되돌리기 한 번에 원래 자리·방향으로 돌아간다", async ({ page, isMobile }) => {
    await dragFloorCm(page, FLOOR, { x: 130, y: 70 }, { x: 265, y: 70 }, isMobile);
    await expect.poll(() => savedShelf(page)).toEqual([274, 70, 90]);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect.poll(() => savedShelf(page)).toEqual([130, 70, 0]);
  });
});
