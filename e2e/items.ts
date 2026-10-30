import { expect, type Page } from "@playwright/test";
import { createSpace } from "./helpers";
import { openDetails, placeBox, typeButton } from "./boxes";
import { detail } from "./scene";
import { finishEditing } from "./spaces";

/** 가구 상세 패널에서 물건을 넣고 고치는 실제 테스트 도우미. */
export const form = (page: Page, name: "물건 넣기" | "물건 고치기" = "물건 넣기") =>
  detail(page).getByRole("form", { name });
export const row = (page: Page, label: string) =>
  detail(page)
    .getByRole("list", { name: "칸별 물건" })
    .locator(":scope > li")
    .filter({ hasText: label });
export const chips = (page: Page, label: string) =>
  detail(page)
    .getByRole("list", { name: `${label} 물건` })
    .getByRole("button");

export type NewItem = { name: string; slot?: string; memo?: string };

/** [+ 물건 넣기]로 물건 하나를 넣는다 (slot은 칸 이름, 안 주면 열린 채의 칸). */
export async function addItem(page: Page, item: NewItem, opener?: () => Promise<void>) {
  if (opener) await opener();
  else await detail(page).getByRole("button", { name: "물건 넣기" }).click();
  await form(page).getByLabel("물건 이름").fill(item.name);
  if (item.slot) await form(page).getByLabel("칸").selectOption({ label: item.slot });
  if (item.memo) await form(page).getByLabel("메모 (선택)").fill(item.memo);
  await form(page).getByRole("button", { name: "넣기" }).click();
}

/** 서랍장 1(1 ~ 3번째 서랍) 하나를 놓고 메인 화면으로 와서 가구 상세 패널을 연다. */
export async function openDrawer(page: Page, isMobile: boolean) {
  await createSpace(page, { width: "6.0", depth: "4.5" });
  await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
  await openDetails(page);
  await typeButton(page, "서랍장").click();
  await finishEditing(page);
  await detail(page)
    .getByRole("button", { name: /^서랍장 1 물건/ })
    .click();
  await expect(detail(page).getByRole("heading", { name: "서랍장 1" })).toBeVisible();
}
