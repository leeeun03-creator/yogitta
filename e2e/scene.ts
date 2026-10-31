import { expect, type Locator, type Page } from "@playwright/test";
import { pressScreen } from "./helpers";
import { finishEditing } from "./spaces";

/** 메인 화면 3D 공간에서 가구를 누르는 실제 테스트 도우미. */
export const detail = (page: Page) => page.getByRole("complementary", { name: "가구 상세 패널" });
export const space3d = (page: Page) => page.getByRole("img", { name: /^3D 공간,/ });
/** 3D 공간의 가구 이름 라벨. */
export const boxLabel = (page: Page, name: string) =>
  space3d(page).getByTestId("box-label").filter({ hasText: name });
export const resetView = (page: Page) => page.getByRole("button", { name: "처음 보기" });

const EMPTY_INSET_PX = 12; // 3D 공간 왼쪽 위 구석: 바닥 밖 빈 곳

/** 3D 공간 왼쪽 위 구석 (바닥 밖 빈 곳, 가구가 없다). */
export async function cornerPoint(page: Page) {
  const box = await space3d(page).boundingBox();
  return { x: (box?.x ?? 0) + EMPTY_INSET_PX, y: (box?.y ?? 0) + EMPTY_INSET_PX };
}

/** 라벨이 멈출 때까지(연달아 잰 자리가 같을 때까지) 기다린 뒤 자리를 돌려준다. */
export async function settledBox(label: Locator) {
  let last = "";
  await expect
    .poll(
      async () => {
        const now = JSON.stringify(await label.boundingBox());
        const isSame = now === last;
        last = now;
        return isSame;
      },
      { intervals: [100] },
    )
    .toBe(true);
  return label.boundingBox();
}

/**
 * 3D에서 가구 몸통을 누른다. 이름 라벨은 가구 맨 위 가운데 바로 위에 뜨므로 라벨 아래(below px)를 누르면
 * 그 가구 윗면이 눌린다. below가 0이면 라벨 가운데(라벨 누르기)다.
 * 휴대폰은 가구 상세 패널이 열리면 3D 영역이 줄어 라벨이 움직이므로 멈춘 뒤에 잰다.
 */
export async function pickBox(
  page: Page,
  root: Locator,
  name: string,
  isMobile: boolean,
  below = 30,
) {
  await pressScreen(page, await boxPoint(root, name, below), isMobile);
}

/** 가구 이름 라벨 가운데에서 below px 아래 화면 자리 (라벨이 멈춘 뒤에 잰다). */
export async function boxPoint(root: Locator, name: string, below = 30) {
  const label = await settledBox(root.getByTestId("box-label").filter({ hasText: name }));
  return {
    x: (label?.x ?? 0) + (label?.width ?? 0) / 2,
    y: (label?.y ?? 0) + (label?.height ?? 0) / 2 + below,
  };
}

/** 메인 화면으로 돌아가 3D 카메라가 자리를 잡을 때까지(확대 버튼이 풀림) 기다린다. 그 전에는 라벨 자리가 아직 움직인다. */
export async function openMainScene(page: Page) {
  await finishEditing(page);
  await expect(page.getByRole("button", { name: "확대" })).toBeEnabled();
}
