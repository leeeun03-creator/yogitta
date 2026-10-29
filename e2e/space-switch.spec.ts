import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, pressCm } from "./helpers";
import {
  addSpaceFromList,
  editTitle,
  finishEditing,
  openMain,
  pill,
  spaceItem,
  spaceList,
} from "./spaces";

const FLOOR = { w: 600, h: 450 };
const MANY_SPACES = 10;
const LONG_NAME = "할머니댁 이층 끝 작은 방 옆 다용도실 창고";

const space3D = (page: Page) => page.getByRole("img", { name: /^3D 공간,/ });

/** 편집 모드에서 직선 도구로 가로 벽을 y(cm)마다 긋는다. */
async function drawWalls(page: Page, ys: number[], isMobile: boolean) {
  await chooseTool(page, "직선");
  for (const y of ys) {
    const ends = [
      { x: 100, y },
      { x: 500, y },
    ];
    await pressCm(page, FLOOR, ends, isMobile);
  }
}

/** 공간 전환 목록에서 name 공간을 고른다. */
async function pickSpace(page: Page, from: string, name: string) {
  await pill(page, from).click();
  await spaceItem(page, name).click();
  await expect(pill(page, name)).toBeVisible();
}

test.describe("목록에서 다른 공간을 골라 바꾸기", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await createTwoSpaces(page, isMobile);
  });

  test("고르면 목록이 닫히고 알약·3D 공간이 그 공간으로 바뀐다 (화면 구성은 그대로)", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await expect(space3D(page)).toHaveAccessibleName(/벽 2개/);
    await pickSpace(page, "형 방", "내 방");
    await expect(spaceList(page)).toHaveCount(0);
    await expect(space3D(page)).toHaveAccessibleName(/벽 1개/);
    await expect(page.getByRole("searchbox", { name: "물건 검색" })).toBeVisible();
    await pickSpace(page, "내 방", "형 방");
    await expect(space3D(page)).toHaveAccessibleName(/벽 2개/);
    expect(errors).toEqual([]);
  });

  test("바꾼 뒤 [편집]을 누르면 그 공간의 편집 모드이고, 되돌리기로 다른 공간을 건드리지 않는다", async ({
    page,
  }) => {
    await pickSpace(page, "형 방", "내 방");
    await page.getByRole("button", { name: "편집" }).click();
    await expect(editTitle(page)).toBeVisible();
    await expect(page.getByText("내 방 · 6.0 × 4.5 m")).toBeVisible();
    // 공간을 바꾸면 되돌리기 기록을 비운다 (형 방에서 그린 벽을 되돌려 지우지 않게)
    await expect(page.getByRole("button", { name: "되돌리기" })).toBeDisabled();
    await finishEditing(page);
    await pickSpace(page, "내 방", "형 방");
    await expect(space3D(page)).toHaveAccessibleName(/벽 2개/);
  });

  test("엣지: 지금 공간을 다시 고르면 닫히기만 하고 그대로다", async ({ page }) => {
    await pill(page, "형 방").click();
    await spaceItem(page, "형 방").click();
    await expect(spaceList(page)).toHaveCount(0);
    await expect(space3D(page)).toHaveAccessibleName(/벽 2개/);
  });

  test("엣지: 키보드만으로 열고 ↑↓로 옮겨 Enter로 바꾸면 초점이 알약으로 온다", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await pill(page, "형 방").focus();
    await page.keyboard.press("Enter");
    await expect(spaceItem(page, "형 방")).toBeFocused();
    await page.keyboard.press("ArrowDown"); // 마지막에서 처음으로 돈다
    await expect(spaceItem(page, "내 방")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(spaceItem(page, "형 방")).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    await expect(pill(page, "내 방")).toBeFocused();
    await expect(space3D(page)).toHaveAccessibleName(/벽 1개/);
  });
});

test.describe("공간이 많거나 이름이 길 때", () => {
  test("엣지: 공간 10개면 목록 안에서 넘겨 마지막 공간까지 고를 수 있다", async ({ page }) => {
    test.setTimeout(90_000); // 공간 10개를 만든다
    await openMain(page);
    let current = "내 방";
    for (let index = 2; index <= MANY_SPACES; index++) {
      await addSpaceFromList(page, `공간 ${index}`, current);
      await finishEditing(page);
      current = `공간 ${index}`;
    }
    await pill(page, current).click();
    await expect(spaceList(page).getByRole("listitem")).toHaveCount(MANY_SPACES);
    const list = await spaceList(page).boundingBox();
    expect(list?.height ?? 0).toBeLessThan(page.viewportSize()?.height ?? 0);
    await spaceItem(page, "내 방").click(); // 위로 넘겨 처음 공간
    await expect(pill(page, "내 방")).toBeVisible();
  });

  test("엣지: 긴 공간 이름은 목록에서 말줄임되고 목록 폭을 넘지 않는다", async ({ page }) => {
    await openMain(page);
    await addSpaceFromList(page, LONG_NAME);
    await finishEditing(page);
    await pill(page, LONG_NAME).click();
    const item = await spaceItem(page, LONG_NAME).boundingBox();
    const list = await spaceList(page).boundingBox();
    expect((item?.x ?? 0) + (item?.width ?? 0)).toBeLessThanOrEqual(
      (list?.x ?? 0) + (list?.width ?? 0),
    );
    const name = spaceItem(page, LONG_NAME).getByText(LONG_NAME, { exact: true });
    expect(await name.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  });
});

/** 내 방(벽 1개)과 형 방(벽 2개)을 만들고, 형 방의 메인 화면에서 끝난다. */
async function createTwoSpaces(page: Page, isMobile: boolean) {
  await openMain(page);
  await page.getByRole("button", { name: "편집" }).click();
  await drawWalls(page, [100], isMobile);
  await finishEditing(page);
  await addSpaceFromList(page, "형 방");
  await drawWalls(page, [100, 300], isMobile);
  await finishEditing(page);
}
