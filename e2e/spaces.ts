import { expect, type Page } from "@playwright/test";
import { createSpace } from "./helpers";

/** 메인 화면 머리의 공간 알약 (이름 = "공간 " + 지금 공간 이름). */
export const pill = (page: Page, name = "내 방") =>
  page.getByRole("button", { name: `공간 ${name}`, exact: true });
/** 공간 알약을 누르면 열리는 공간 전환 목록. */
export const spaceList = (page: Page) => page.getByRole("region", { name: "공간 바꾸기" });
/** 목록의 공간 한 줄 (이름 = 공간 이름 + 한 줄 설명). */
export const spaceItem = (page: Page, name: string) =>
  spaceList(page).getByRole("button", { name: new RegExp(`^${name} [0-9]`) });
/** "+ 새 공간 만들기"로 여는 바닥 크기 카드 대화상자. */
export const newSpaceDialog = (page: Page) =>
  page.getByRole("dialog", { name: "바닥 크기를 정해요" });
export const mainTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "요깃따" });
export const editTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "편집 모드" });

/** 편집 모드에서 [‹ 완료]를 눌러 메인 화면으로 간다. */
export async function finishEditing(page: Page) {
  await page.getByRole("button", { name: "완료" }).click();
  await expect(mainTitle(page)).toBeVisible();
}

/** 새 공간("내 방")을 만들고 [‹ 완료]로 메인 화면에 온다. */
export async function openMain(page: Page) {
  await createSpace(page, { width: "6.0", depth: "4.5" });
  await finishEditing(page);
}

/** 지금 공간 알약(current)에서 목록의 "+ 새 공간 만들기"로 대화상자를 연다. */
export async function openNewSpaceDialog(page: Page, current = "내 방") {
  await pill(page, current).click();
  await spaceList(page).getByRole("button", { name: "새 공간 만들기" }).click();
  await expect(newSpaceDialog(page)).toBeVisible();
}

/** 메인 화면에서 name 공간을 새로 만든다. 끝나면 그 공간의 편집 모드다. */
export async function addSpaceFromList(page: Page, name: string, current = "내 방") {
  await openNewSpaceDialog(page, current);
  await newSpaceDialog(page).getByLabel("공간 이름").fill(name);
  await newSpaceDialog(page).getByRole("button", { name: "벽 그리러 가기" }).click();
  await expect(editTitle(page)).toBeVisible();
}
