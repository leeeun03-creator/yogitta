import { expect, type Page } from "@playwright/test";
import { chooseTool, cmToScreen, dragPath, pressCm } from "./helpers";

type Cm = { x: number; y: number };
const FLOOR = { w: 600, h: 450 }; // 구역 테스트는 모두 6.0 × 4.5 m 바닥에서 한다

/** 2D 평면도 그림(svg). */
const planImage = (page: Page) => page.getByRole("img", { name: /^2D 평면도,/ });

/** 2D 평면도 아래 구역 목록의 칩들. */
export const rooms = (page: Page) => page.getByRole("list", { name: "구역" }).getByRole("listitem");
/** 구역 칩 하나 (누르면 고르는 버튼). */
export const roomChip = (page: Page, name: string) =>
  page.getByRole("list", { name: "구역" }).getByRole("button", { name, exact: true });
/** 이름 없는 구획을 누르면 뜨는 새 구역 이름 입력칸. */
export const nameInput = (page: Page) => page.getByRole("textbox", { name: "새 구역 이름" });
/** 2D 평면도에 칠한 구역들 (data-room = 구역 이름). */
export const roomAreas = (page: Page) => planImage(page).getByTestId("room-area");
/** 2D 평면도에 쓴 구역 이름들. */
export const roomLabels = (page: Page) => planImage(page).getByTestId("room-label");

/** 바닥 좌표(cm) 경로를 따라 끈다. beforeUp은 떼기 직전에 부른다 (끄는 중 화면 확인용). */
export async function dragCm(
  page: Page,
  path: Cm[],
  isMobile: boolean,
  beforeUp?: () => Promise<void>,
) {
  const screen = await Promise.all(path.map((point) => cmToScreen(page, FLOOR, point)));
  await dragPath(page, screen, isMobile, beforeUp);
}

/** 바닥을 위에서 아래로 가로지르는 구역 선을 x(cm)마다 그어 구획을 나눈다. 끝나면 선택 도구로 돌아온다. */
export async function splitAt(page: Page, xs: number[], isMobile: boolean) {
  await chooseTool(page, "구역 선");
  for (const x of xs) {
    await dragCm(
      page,
      [
        { x, y: 15 },
        { x, y: 435 },
      ],
      isMobile,
    );
  }
  await chooseTool(page, "선택");
}

/** 선택 도구로 바닥 at(cm)을 누르고, 뜬 입력칸에 이름을 써서 Enter로 구역을 만든다. */
export async function makeRoom(page: Page, name: string, at: Cm, isMobile: boolean) {
  await pressCm(page, FLOOR, [at], isMobile);
  await expect(nameInput(page)).toBeFocused();
  await nameInput(page).fill(name);
  await nameInput(page).press("Enter");
  await expect(nameInput(page)).toHaveCount(0);
}

/** 그린 구역 선들의 점 목록(cm). */
export async function roomLinePoints(page: Page) {
  const lines = await planImage(page).getByTestId("room-line").all();
  return Promise.all(
    lines.map(async (line) =>
      ((await line.getAttribute("data-points")) ?? "")
        .split(" ")
        .map((pair) => pair.split(",").map(Number)),
    ),
  );
}
