import type { Page } from "@playwright/test";

/** 2D 평면도 아래 구역 목록의 칩들. */
export const rooms = (page: Page) => page.getByRole("list", { name: "구역" }).getByRole("listitem");
/** 구역 칩 하나 (누르면 고르는 버튼). */
export const roomChip = (page: Page, name: string) =>
  page.getByRole("list", { name: "구역" }).getByRole("button", { name, exact: true });
export const addButton = (page: Page) => page.getByRole("button", { name: "+ 구역 추가" });
export const nameInput = (page: Page) => page.getByRole("textbox", { name: "새 구역 이름" });

/** "+ 구역 추가"를 누르고 이름을 써서 Enter로 더한다. */
export async function addRoom(page: Page, name: string) {
  await addButton(page).click();
  await nameInput(page).fill(name);
  await nameInput(page).press("Enter");
}
