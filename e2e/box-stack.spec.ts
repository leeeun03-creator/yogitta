import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, dragFloorCm, openPreview, pressCm } from "./helpers";
import {
  FLOOR,
  detailsToggle,
  expectBox,
  openDetails,
  panel,
  placeBox,
  sizeField,
  typeButton,
} from "./boxes";
import { STORAGE_KEY } from "../src/shared/constants/storage";

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
async function savedBoxes(page: Page) {
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

const expectSaved = (page: Page, entry: (string | number | null)[]) =>
  expect.poll(() => savedStack(page)).toContainEqual(entry);

/** 저장된 가구 하나가 기대한 자리·방향·설치 높이가 될 때까지 기다린다. */
const expectSavedBox = (page: Page, name: string, expected: Partial<SavedBox>) =>
  expect
    .poll(async () => (await savedBoxes(page)).find((box) => box.name === name))
    .toMatchObject(expected);

/** 고른 가구의 종류를 바꾼다. 휴대폰은 종류·크기를 펴서 고르고, 다시 접어 평면도를 덮지 않게 한다. */
async function chooseType(page: Page, name: string, after?: () => Promise<void>) {
  await openDetails(page);
  await typeButton(page, name).click();
  await after?.();
  if (await detailsToggle(page).isVisible()) await detailsToggle(page).click();
}

/**
 * 책상 1(가운데 (300, 200), 120 × 60 × 73)과 보관함 1(가운데 (80, 75), 40 × 30 × 90)을 놓는다.
 * 격자 스냅이 켜져 있어 끈 자리는 가구 왼쪽 위 모서리가 10cm 격자에 맞는다 (보관함 가운데 y는 …5).
 */
async function placeDeskAndBox(page: Page, isMobile: boolean) {
  await createSpace(page, { width: "6.0", depth: "4.5" });
  await placeBox(page, { x: 240, y: 170 }, { x: 360, y: 230 }, isMobile);
  await chooseType(page, "책상", () =>
    panel(page).getByRole("button", { name: "기본 높이 73cm로" }).click(),
  );
  await placeBox(page, { x: 60, y: 60 }, { x: 100, y: 90 }, isMobile);
}

test.describe("2D에서 가구를 다른 가구 위로 끌어 올리고 바닥으로 내리기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(({ page, isMobile }) => placeDeskAndBox(page, isMobile));

  test("보관함을 책상 위로 끌면 책상 위(설치 높이 73)에 올라가 위에 보이고, 책상 밖으로 끌면 바닥으로 내려온다", async ({
    page,
    isMobile,
  }, testInfo) => {
    const errors = collectErrors(page);
    await dragFloorCm(page, FLOOR, { x: 80, y: 75 }, { x: 300, y: 205 }, isMobile);
    await expectSaved(page, ["보관함 1", 73, "책상 1"]);
    await expectBox(page, [300, 205, 40, 30], 1); // 2D는 낮은 가구부터 그려 보관함이 위(나중)에 있다
    await page.screenshot({ path: testInfo.outputPath("stacked-2d.png") });
    await dragFloorCm(page, FLOOR, { x: 300, y: 205 }, { x: 450, y: 205 }, isMobile);
    await expectSaved(page, ["보관함 1", 0, null]);
    await expectBox(page, [450, 205], 1);
    await page.getByRole("button", { name: "되돌리기" }).click(); // 다시 책상 위
    await expectSaved(page, ["보관함 1", 73, "책상 1"]);
    await openPreview(page); // 3D 미리보기에서 책상 위에 선다 (모양은 스크린샷으로 본다)
    await page.screenshot({ path: testInfo.outputPath("stacked-3d.png") });
    expect(errors).toEqual([]);
  });

  test("엣지: 되돌리기 한 번에 바닥 원래 자리로 돌아간다", async ({ page, isMobile }) => {
    await dragFloorCm(page, FLOOR, { x: 80, y: 75 }, { x: 300, y: 205 }, isMobile);
    await expectSaved(page, ["보관함 1", 73, "책상 1"]);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expectSaved(page, ["보관함 1", 0, null]);
    await expectBox(page, [80, 75], 1);
  });

  test("엣지: 책상 위 보관함 위로 끌면 맨 위 보관함 위(73 + 90 = 163)로 올라간다", async ({
    page,
    isMobile,
  }) => {
    await dragFloorCm(page, FLOOR, { x: 80, y: 75 }, { x: 300, y: 205 }, isMobile);
    await placeBox(page, { x: 460, y: 60 }, { x: 500, y: 90 }, isMobile); // 보관함 2: (480, 75)
    await dragFloorCm(page, FLOOR, { x: 480, y: 75 }, { x: 300, y: 205 }, isMobile);
    await expectSaved(page, ["보관함 2", 163, "보관함 1"]);
  });

  test("엣지: 벽걸이는 책상 위로 올라가지 않고, 책상보다 높이 떠 있어 그 위를 지나간다", async ({
    page,
    isMobile,
  }) => {
    await chooseType(page, "벽걸이");
    await dragFloorCm(page, FLOOR, { x: 80, y: 75 }, { x: 300, y: 205 }, isMobile);
    await expectSaved(page, ["벽걸이 1", 150, null]);
  });
});

test.describe("받침 가구를 옮기거나 돌리면 가구 위 가구도 같이 따라가기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  // 보관함 1을 책상 오른쪽 (330, 205)에 올려 두고, 책상의 빈 곳 (260, 200)을 눌러 책상을 다룬다
  test.beforeEach(async ({ page, isMobile }) => {
    await placeDeskAndBox(page, isMobile);
    await dragFloorCm(page, FLOOR, { x: 80, y: 75 }, { x: 330, y: 205 }, isMobile);
    await expectSaved(page, ["보관함 1", 73, "책상 1"]);
  });

  test("책상을 끌면 보관함이 같이 움직이고(끄는 동안에도 같이 그려진다), 되돌리기 한 번에 함께 돌아간다", async ({
    page,
    isMobile,
  }) => {
    await dragFloorCm(page, FLOOR, { x: 260, y: 200 }, { x: 160, y: 300 }, isMobile, () =>
      expectBox(page, [230, 305], 1),
    );
    await expectSavedBox(page, "책상 1", { x: 200, z: 300 });
    await expectSavedBox(page, "보관함 1", { x: 230, z: 305, elevation: 73 });
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expectSavedBox(page, "책상 1", { x: 300, z: 200 });
    await expectSavedBox(page, "보관함 1", { x: 330, z: 205 });
  });

  test("책상을 90도 돌리면 보관함이 책상 가운데를 축으로 같이 돈다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [{ x: 260, y: 200 }], isMobile); // 책상 고르기
    await panel(page).getByRole("button", { name: "90° 회전" }).click();
    await expectSavedBox(page, "책상 1", { rotation: 90 });
    await expectSavedBox(page, "보관함 1", { x: 295, z: 230, rotation: 90, elevation: 73 }); // (30, 5) → (-5, 30)
  });

  test("엣지: 책상 높이를 바꾸면 보관함 설치 높이가 따라 바뀐다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [{ x: 260, y: 200 }], isMobile);
    await openDetails(page);
    await sizeField(page, "높이").fill("100");
    await sizeField(page, "높이").press("Enter");
    await expectSaved(page, ["보관함 1", 100, "책상 1"]);
  });
});
