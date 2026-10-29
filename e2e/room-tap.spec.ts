import { expect, test, type Page } from "@playwright/test";
import { chooseTool, cmToScreen, collectErrors, createSpace, plan, pressCm } from "./helpers";
import { dragCm, makeRoom, nameInput, roomLabels, roomLinePoints } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const SPLIT = [
  { x: 300, y: 15 },
  { x: 300, y: 435 },
];
const preview = (page: Page) => plan(page).getByTestId("part-preview");
const hoverCm = async (page: Page, point: { x: number; y: number }) => {
  const at = await cmToScreen(page, FLOOR, point);
  await page.mouse.move(at.x, at.y);
};

test.describe("구역 선 도구 그대로 구획 누르기", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "구역 선");
    await dragCm(page, SPLIT, isMobile);
  });

  test("구역 선을 긋고 도구를 바꾸지 않고 누르면 이름 입력칸이 떠서 구역을 만든다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await makeRoom(page, "안방", { x: 150, y: 200 }, isMobile);
    await makeRoom(page, "거실", { x: 450, y: 200 }, isMobile);
    await expect(roomLabels(page)).toHaveText(["안방", "거실"]);
    await expect(page.getByRole("button", { name: "구역 선", pressed: true })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("엣지: 끌면 입력칸이 뜨지 않고 구역 선을 하나 더 긋는다", async ({ page, isMobile }) => {
    await dragCm(
      page,
      [
        { x: 15, y: 200 },
        { x: 285, y: 200 },
      ],
      isMobile,
    );
    expect(await roomLinePoints(page)).toHaveLength(2);
    await expect(nameInput(page)).toHaveCount(0);
  });

  test("엣지: 구역 선 위를 누르면 입력칸이 뜨지 않고 선도 생기지 않는다", async ({
    page,
    isMobile,
  }) => {
    await pressCm(page, FLOOR, [{ x: 300, y: 225 }], isMobile);
    await expect(nameInput(page)).toHaveCount(0);
    expect(await roomLinePoints(page)).toHaveLength(1);
  });

  test("이름 입력칸이 뜬 동안 그 구획만 옅게 칠하고, 만들면 사라진다", async ({
    page,
    isMobile,
  }) => {
    await pressCm(page, FLOOR, [{ x: 150, y: 200 }], isMobile);
    await expect(preview(page)).toHaveCount(1);
    const box = await preview(page).boundingBox();
    const middle = await cmToScreen(page, FLOOR, { x: 300, y: 225 });
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(middle.x + 2); // 왼쪽 구획만
    await nameInput(page).fill("안방");
    await nameInput(page).press("Enter");
    if (!isMobile) await page.mouse.move(0, 0);
    await expect(preview(page)).toHaveCount(0);
  });
});

test.describe("마우스를 올린 구획 표시", () => {
  test.skip(({ isMobile }) => isMobile, "휴대폰에는 마우스 올리기가 없다");

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await chooseTool(page, "구역 선");
    await dragCm(page, SPLIT, false);
  });

  test("이름 없는 구획에 올리면 옅게 칠하고, 구역·선 위·바닥 밖에서는 칠하지 않는다", async ({
    page,
  }) => {
    await hoverCm(page, { x: 450, y: 200 });
    await expect(preview(page)).toHaveCount(1);
    await hoverCm(page, { x: 300, y: 200 });
    await expect(preview(page)).toHaveCount(0);
    await makeRoom(page, "거실", { x: 450, y: 200 }, false);
    await hoverCm(page, { x: 460, y: 210 });
    await expect(preview(page)).toHaveCount(0); // 이미 구역
    await hoverCm(page, { x: 150, y: 200 });
    await expect(preview(page)).toHaveCount(1);
    await page.mouse.move(1, 1);
    await expect(preview(page)).toHaveCount(0);
  });

  test("엣지: 벽 그리기 도구에서는 올려도 칠하지 않는다", async ({ page }) => {
    await chooseTool(page, "직선");
    await hoverCm(page, { x: 150, y: 200 });
    await expect(preview(page)).toHaveCount(0);
  });
});
