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

type Cm = { x: number; y: number };

/** 화면 좌표(px)를 누른다. 모바일은 탭, 데스크톱은 클릭. */
export async function pressScreen(page: Page, point: Cm, isMobile: boolean) {
  if (isMobile) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

/** 바닥 좌표(cm)들을 차례로 누른다. */
export async function pressCm(
  page: Page,
  floor: { w: number; h: number },
  points: Cm[],
  isMobile: boolean,
) {
  for (const point of points)
    await pressScreen(page, await cmToScreen(page, floor, point), isMobile);
}

/** 읽은 벽 점 목록이 기대한 점들과 1cm 안으로 같은지 본다 (화면 px → cm 반올림 오차). */
export function expectNear(actual: number[][] | undefined, expected: Cm[]) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(({ x, y }, index) => {
    expect(Math.abs((actual?.[index]?.[0] ?? NaN) - x)).toBeLessThanOrEqual(1);
    expect(Math.abs((actual?.[index]?.[1] ?? NaN) - y)).toBeLessThanOrEqual(1);
  });
}

type TouchType = "touchStart" | "touchMove";
const DRAG_STEPS = 5; // 지나는 점 사이를 몇 번에 나눠 움직이나

/** 화면 좌표(px) path를 차례로 지나며 끈다. 모바일은 CDP 터치(Playwright 터치스크린은 탭만 된다). beforeUp은 떼기 직전에 돈다. */
export async function dragPath(
  page: Page,
  path: Cm[],
  isMobile: boolean,
  beforeUp?: () => Promise<void>,
) {
  const [first, ...rest] = path;
  if (!first) return;
  const cdp = isMobile ? await page.context().newCDPSession(page) : null;
  const move = async (type: TouchType, p: Cm) => {
    if (cdp) await cdp.send("Input.dispatchTouchEvent", { type, touchPoints: [{ ...p, id: 1 }] });
    else await page.mouse.move(p.x, p.y);
  };
  await move("touchStart", first);
  if (!cdp) await page.mouse.down();
  let from = first;
  for (const to of rest) {
    for (let i = 1; i <= DRAG_STEPS; i++) {
      const ratio = i / DRAG_STEPS;
      await move("touchMove", {
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio,
      });
    }
    from = to;
  }
  await beforeUp?.();
  if (cdp) await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  else await page.mouse.up();
}

/** 화면 좌표(px) a → b로 끈다. */
export const dragScreen = (
  page: Page,
  a: Cm,
  b: Cm,
  isMobile: boolean,
  beforeUp?: () => Promise<void>,
) => dragPath(page, [a, b], isMobile, beforeUp);

/** 바닥 좌표(cm) from → to로 끈다. */
export async function dragFloorCm(
  page: Page,
  floor: { w: number; h: number },
  from: Cm,
  to: Cm,
  isMobile: boolean,
  beforeUp?: () => Promise<void>,
) {
  const a = await cmToScreen(page, floor, from);
  const b = await cmToScreen(page, floor, to);
  await dragScreen(page, a, b, isMobile, beforeUp);
}
