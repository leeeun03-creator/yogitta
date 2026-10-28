import { expect, type Page } from "@playwright/test";

/** 첫 실행 화면에서 바닥 크기를 넣고 공간을 만들어 편집 모드로 들어간다. */
export async function createSpace(page: Page, size: { width: string; depth: string }) {
  await page.goto("./");
  await page.getByLabel("가로 (m)").fill(size.width);
  await page.getByLabel("세로 (m)").fill(size.depth);
  await page.getByRole("button", { name: "벽 그리러 가기" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
}

const FLOOR_STROKE_PX = 1; // 바닥 테두리는 줌과 상관없이 1px

/** 바닥 사각형의 화면 위치·크기(px). 테두리 선 두께는 빼서 바닥만 잰다. */
export async function floorBox(page: Page) {
  const box = await page.getByTestId("floor").boundingBox();
  if (!box) throw new Error("바닥이 보이지 않는다");
  const half = FLOOR_STROKE_PX / 2;
  return {
    x: box.x + half,
    y: box.y + half,
    width: box.width - FLOOR_STROKE_PX,
    height: box.height - FLOOR_STROKE_PX,
  };
}

/** 바닥 좌표(cm)를 지금 화면 좌표(px)로 바꾼다. */
export async function cmToScreen(
  page: Page,
  floor: { w: number; h: number },
  cm: { x: number; y: number },
) {
  const box = await floorBox(page);
  return { x: box.x + (cm.x / floor.w) * box.width, y: box.y + (cm.y / floor.h) * box.height };
}

/** 그린 벽들의 점 목록(cm)을 읽는다. */
export async function wallPoints(page: Page) {
  const walls = await page.getByTestId("wall").all();
  return Promise.all(
    walls.map(async (wall) =>
      ((await wall.getAttribute("data-points")) ?? "")
        .split(" ")
        .map((pair) => pair.split(",").map(Number)),
    ),
  );
}

/** 그리기 도구를 고른다. */
export async function chooseTool(page: Page, name: string) {
  await page
    .getByRole("toolbar", { name: "그리기 도구" })
    .getByRole("button", { name, exact: true })
    .click();
}
