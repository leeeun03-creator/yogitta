import { expect, test, type Page } from "@playwright/test";
import { createSpace, dragPath, pressScreen, touchSender } from "./helpers";
import { placeBox } from "./boxes";
import { boxPoint, detail, openMainScene, pickBox, settledBox, space3d } from "./scene";

const listHeading = (page: Page) => detail(page).getByRole("heading", { name: "가구" });
const boxHeading = (page: Page) => detail(page).getByRole("heading", { name: "보관함 1" });
const viewButton = (page: Page, name: string) => page.getByRole("button", { name });

const DRAG_PX = 60; // 3D를 돌리는 끌기
const SMALL_MOVE_PX = 3; // 누르기로 치는 움직임 (TAP_MOVE_PX 5 안)
const EMPTY_INSET_PX = 12; // 3D 공간 왼쪽 위 구석: 바닥 밖 빈 곳
const FLOOR_RATIO = 0.7; // 3D 공간 앞 오른쪽(가로·세로 70%): 보관함 1(바닥 왼쪽 뒤)에서 먼 바닥

/** 3D 공간 안의 자리: 왼쪽 위 구석(빈 곳)과 앞 오른쪽 바닥(가구 없음). */
async function scenePoints(page: Page) {
  const box = await space3d(page).boundingBox();
  const x = box?.x ?? 0;
  const y = box?.y ?? 0;
  return {
    corner: { x: x + EMPTY_INSET_PX, y: y + EMPTY_INSET_PX },
    floor: { x: x + (box?.width ?? 0) * FLOOR_RATIO, y: y + (box?.height ?? 0) * FLOOR_RATIO },
  };
}

test.describe("3D에서 돌리기와 누르기를 가르고, 빈 곳을 누르면 닫기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 50, y: 50 }, { x: 200, y: 150 }, isMobile); // 보관함 1
    await openMainScene(page);
  });

  test("가구 위에서 끌어 돌리면 제자리에서 떼도 가구 상세 패널이 열리지 않는다", async ({
    page,
    isMobile,
  }) => {
    const at = await boxPoint(space3d(page), "보관함 1");
    await dragPath(page, [at, { x: at.x + DRAG_PX, y: at.y }, at], isMobile);
    // 돌렸다가 제자리로 돌아오므로 카메라도 처음 자리다. 끄는 동안 움직였으니 누르기가 아니다
    await expect(listHeading(page)).toBeVisible();
  });

  test("엣지: 누른 자리에서 조금(5px 안) 움직여 떼면 누르기다", async ({ page, isMobile }) => {
    const at = await boxPoint(space3d(page), "보관함 1");
    await dragPath(page, [at, { x: at.x + SMALL_MOVE_PX, y: at.y }], isMobile);
    await expect(boxHeading(page)).toBeVisible();
  });

  test("가구가 아닌 곳(바닥·빈 곳)을 누르면 가구 상세 패널이 닫혀 목록으로 돌아간다", async ({
    page,
    isMobile,
  }) => {
    for (const where of ["floor", "corner"] as const) {
      await pickBox(page, space3d(page), "보관함 1", isMobile);
      await expect(boxHeading(page)).toBeVisible();
      await pressScreen(page, (await scenePoints(page))[where], isMobile);
      await expect(listHeading(page)).toBeVisible();
    }
  });

  test("엣지: 가구를 누르기만 해서는 카메라가 움직인 것이 아니다 (처음 보기가 꺼져 있다)", async ({
    page,
    isMobile,
  }) => {
    // 휴대폰은 패널이 열리면 3D 영역이 줄어드는데, 움직이지 않았으니 처음 자리로 다시 맞춘다
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(boxHeading(page)).toBeVisible();
    await settledBox(space3d(page).getByTestId("box-label")); // 3D 영역 크기 바뀜이 끝날 때까지
    await expect(viewButton(page, "처음 보기")).toBeDisabled();
  });

  test("엣지: 보기 버튼을 눌러도 가구 상세 패널은 닫히지 않는다", async ({ page, isMobile }) => {
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await viewButton(page, "확대").click();
    await viewButton(page, "처음 보기").click();
    await expect(boxHeading(page)).toBeVisible();
  });

  test("엣지: 두 손가락으로 확대하면 한 손가락이 제자리여도 누르기가 아니다", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "두 손가락은 휴대폰에서만");
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(boxHeading(page)).toBeVisible();
    // 첫 손가락은 바닥(누르면 닫히는 곳)에 가만히 두고 둘째 손가락만 벌린다
    const { floor } = await scenePoints(page);
    const send = await touchSender(page);
    const fingers = (gap: number) => [floor, { x: floor.x + gap, y: floor.y }];
    await send("touchStart", fingers(20));
    for (const gap of [40, 60, 80]) await send("touchMove", fingers(gap));
    await send("touchEnd", []);
    await expect(viewButton(page, "처음 보기")).toBeEnabled(); // 확대됐다
    await expect(boxHeading(page)).toBeVisible();
  });
});
