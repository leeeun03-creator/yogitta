import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, dragFloorCm, openPreview } from "./helpers";
import { FLOOR, detailsToggle, expectBox, openDetails, panel, placeBox, typeButton } from "./boxes";
import { STORAGE_KEY } from "../src/shared/constants/storage";

// 저장 데이터 중 이 테스트가 보는 것만 (src 타입은 @/ 경로라 e2e에서 가져오지 않는다)
type Saved = {
  currentSpaceId: string | null;
  spaces: {
    id: string;
    boxes: { id: string; name: string; elevation: number; parentId?: string }[];
  }[];
};

/** 저장된 현재 공간 가구마다 [이름, 설치 높이, 받침 가구 이름]. */
async function savedStack(page: Page) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  const data: Saved = JSON.parse(raw ?? '{"spaces":[]}');
  const boxes = data.spaces.find((space) => space.id === data.currentSpaceId)?.boxes ?? [];
  const nameOf = (id?: string) => boxes.find((box) => box.id === id)?.name ?? null;
  return boxes.map((box) => [box.name, box.elevation, nameOf(box.parentId)]);
}

const expectSaved = (page: Page, entry: (string | number | null)[]) =>
  expect.poll(() => savedStack(page)).toContainEqual(entry);

/** 고른 가구의 종류를 바꾼다. 휴대폰은 종류·크기를 펴서 고르고, 다시 접어 평면도를 덮지 않게 한다. */
async function chooseType(page: Page, name: string, after?: () => Promise<void>) {
  await openDetails(page);
  await typeButton(page, name).click();
  await after?.();
  if (await detailsToggle(page).isVisible()) await detailsToggle(page).click();
}

test.describe("2D에서 가구를 다른 가구 위로 끌어 올리고 바닥으로 내리기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 240, y: 170 }, { x: 360, y: 230 }, isMobile); // 가운데 (300, 200)
    await chooseType(page, "책상", () =>
      panel(page).getByRole("button", { name: "기본 높이 73cm로" }).click(),
    );
    await placeBox(page, { x: 60, y: 60 }, { x: 100, y: 90 }, isMobile); // 보관함 1: (80, 75), 40 × 30 × 90
    // 격자 스냅이 켜져 있어 끈 자리는 가구 왼쪽 위 모서리가 10cm 격자에 맞는다 (가운데 y는 …5)
  });

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
