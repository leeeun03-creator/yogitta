import { expect, type Page } from "@playwright/test";
import { createSpace, dragFloorCm } from "./helpers";
import { FLOOR, detailsToggle, openDetails, panel, placeBox, typeButton } from "./boxes";
import { STORAGE_KEY } from "../src/shared/constants/storage";

/** 가구 위 가구(T29) 실제 테스트 도우미. */

// 저장 데이터 중 이 테스트가 보는 것만 (src 타입은 @/ 경로라 e2e에서 가져오지 않는다)
type SavedBox = {
  id: string;
  name: string;
  x: number;
  z: number;
  rotation: number;
  elevation: number;
  parentId?: string;
};
type Saved = {
  currentSpaceId: string | null;
  spaces: {
    id: string;
    boxes: SavedBox[];
  }[];
};

/** 저장된 현재 공간 가구들. */
export async function savedBoxes(page: Page) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  const data: Saved = JSON.parse(raw ?? '{"spaces":[]}');
  return data.spaces.find((space) => space.id === data.currentSpaceId)?.boxes ?? [];
}

/** 저장된 현재 공간 가구마다 [이름, 설치 높이, 받침 가구 이름]. */
async function savedStack(page: Page) {
  const boxes = await savedBoxes(page);
  const nameOf = (id?: string) => boxes.find((box) => box.id === id)?.name ?? null;
  return boxes.map((box) => [box.name, box.elevation, nameOf(box.parentId)]);
}

export const expectSaved = (page: Page, entry: (string | number | null)[]) =>
  expect.poll(() => savedStack(page)).toContainEqual(entry);

/** 저장된 가구 하나가 기대한 자리·방향·설치 높이가 될 때까지 기다린다. */
export const expectSavedBox = (page: Page, name: string, expected: Partial<SavedBox>) =>
  expect
    .poll(async () => (await savedBoxes(page)).find((box) => box.name === name))
    .toMatchObject(expected);

/** 고른 가구의 종류를 바꾼다. 휴대폰은 종류·크기를 펴서 고르고, 다시 접어 평면도를 덮지 않게 한다. */
export async function chooseType(page: Page, name: string, after?: () => Promise<void>) {
  await openDetails(page);
  await typeButton(page, name).click();
  await after?.();
  if (await detailsToggle(page).isVisible()) await detailsToggle(page).click();
}

/**
 * 책상 1(가운데 (300, 200), 120 × 60 × 73)과 보관함 1(가운데 (80, 75), 40 × 30 × 90)을 놓는다.
 * 격자 스냅이 켜져 있어 끈 자리는 가구 왼쪽 위 모서리가 10cm 격자에 맞는다 (보관함 가운데 y는 …5).
 */
export async function placeDeskAndBox(page: Page, isMobile: boolean) {
  await createSpace(page, { width: "6.0", depth: "4.5" });
  await placeBox(page, { x: 240, y: 170 }, { x: 360, y: 230 }, isMobile);
  await chooseType(page, "책상", () =>
    panel(page).getByRole("button", { name: "기본 높이 73cm로" }).click(),
  );
  await placeBox(page, { x: 60, y: 60 }, { x: 100, y: 90 }, isMobile);
}

/** 보관함 1을 책상 1 오른쪽 (330, 205)에 올린다 (placeDeskAndBox 뒤). */
export async function stackBoxOnDesk(page: Page, isMobile: boolean) {
  await dragFloorCm(page, FLOOR, { x: 80, y: 75 }, { x: 330, y: 205 }, isMobile);
  await expectSaved(page, ["보관함 1", 73, "책상 1"]);
}
