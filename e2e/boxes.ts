import { expect, type Page } from "@playwright/test";
import { chooseTool, dragFloorCm, plan, pressCm } from "./helpers";

type Cm = { x: number; y: number };

/** 가구 테스트는 모두 6.0 × 4.5 m 바닥에서 한다. */
export const FLOOR = { w: 600, h: 450 };

/** 가구를 고르면 뜨는 속성 패널. */
export const panel = (page: Page) => page.getByRole("complementary", { name: "속성 패널" });
/** 속성 패널의 가구 이름 입력칸. */
export const nameField = (page: Page) =>
  panel(page).getByRole("textbox", { name: "가구 이름", exact: true });
/** 휴대폰 속성 패널의 [종류·크기 ▾] (데스크톱은 숨어 있다). */
export const detailsToggle = (page: Page) => panel(page).getByRole("button", { name: "종류·크기" });

/** 휴대폰에서 접혀 있는 종류·크기를 편다. 데스크톱은 늘 펼쳐 있어 아무것도 하지 않는다. */
export async function openDetails(page: Page) {
  const toggle = detailsToggle(page);
  if (!(await toggle.isVisible())) return;
  if ((await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
}

/** 속성 패널 종류 선택의 종류 버튼 (양문 수납장 … 보관함). */
export const typeButton = (page: Page, name: string) =>
  panel(page).getByRole("group", { name: "종류" }).getByRole("button", { name, exact: true });
/** 가구 자리에 겹친 투명 버튼 (키보드·화면 읽기용, 이름 = 가구 이름). */
export const boxButton = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });

/** 가구 도구로 끌어 놓는다 (놓으면 그 가구가 골라지고 선택 도구가 된다). beforeUp은 떼기 직전에 부른다. */
export async function placeBox(
  page: Page,
  from: Cm,
  to: Cm,
  isMobile: boolean,
  beforeUp?: () => Promise<void>,
) {
  await chooseTool(page, "가구");
  await dragFloorCm(page, FLOOR, from, to, isMobile, beforeUp);
}

/** 속성 패널 이름 입력칸에 써 넣고 Enter (막히면 이름은 그대로다). */
export async function renameBox(page: Page, name: string) {
  await nameField(page).fill(name);
  await nameField(page).press("Enter");
}

/** 직선 도구로 벽 하나를 긋고(두 점을 차례로 누른다) 선택 도구로 돌아온다. */
export async function drawWall(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "직선");
  await pressCm(page, FLOOR, [from, to], isMobile);
  await chooseTool(page, "선택");
}

/** index번째 가구의 [가운데 x, 가운데 y, 가로, 깊이, 회전] (cm·도). */
export async function boxData(page: Page, index = 0) {
  const value = await plan(page).getByTestId("box").nth(index).getAttribute("data-box");
  return (value ?? "").split(",").map(Number);
}

/**
 * index번째 가구가 기대한 값과 1cm 안으로 같아질 때까지 기다린다 (화면 px → cm 반올림 오차).
 * 앞쪽 값만 줘도 된다 (예: [가운데 x, 가운데 y]).
 */
export async function expectBox(page: Page, expected: number[], index = 0) {
  const isNear = (actual: number[]) =>
    expected.every((value, i) => Math.abs((actual[i] ?? NaN) - value) < 1.5);
  await expect
    .poll(async () => isNear(await boxData(page, index)), { message: `가구 ${expected}` })
    .toBe(true);
}
