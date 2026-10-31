import { expect, test, type Page } from "@playwright/test";
import { createSpace, dragScreen, openPreview, pressScreen } from "./helpers";
import { placeBox } from "./boxes";
import { listButton } from "./items";
import {
  boxLabel,
  cornerPoint,
  detail,
  openMainScene,
  pickBox,
  resetView,
  settledBox,
  space3d,
} from "./scene";

const DRAG_PX = 80; // 3D를 돌리는 끌기

/**
 * 가구 이름 라벨 가운데가 3D 공간 가운데에서 떨어진 정도 (3D 공간 높이 = 1, 라벨이 멈춘 뒤). 휴대폰은 패널이 바뀌면
 * 3D 공간 높이가 바뀌는데, 화각이 세로 기준이라 카메라가 그대로면 이 값은 같다.
 */
async function labelOffset(page: Page, name: string) {
  const at = await settledBox(boxLabel(page, name));
  const scene = await space3d(page).boundingBox();
  const height = scene?.height ?? 1;
  const centerX = (scene?.x ?? 0) + (scene?.width ?? 0) / 2;
  const centerY = (scene?.y ?? 0) + height / 2;
  return [
    ((at?.x ?? 0) + (at?.width ?? 0) / 2 - centerX) / height,
    ((at?.y ?? 0) + (at?.height ?? 0) / 2 - centerY) / height,
  ];
}

function expectSameOffset(actual: number[], expected: number[]) {
  expect(actual[0] ?? 0).toBeCloseTo(expected[0] ?? 0, 2);
  expect(actual[1] ?? 0).toBeCloseTo(expected[1] ?? 0, 2);
}

/** 두 가구 이름 라벨 사이 화면 거리 (px, 라벨이 멈춘 뒤). 확대할수록 멀어진다. */
async function labelGap(page: Page) {
  const a = await settledBox(boxLabel(page, "보관함 1"));
  const b = await settledBox(boxLabel(page, "보관함 2"));
  return Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
}

test.describe("3D에서 가구를 누를 때도 그 가구 정면으로 옮겨 가기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 50, y: 50 }, { x: 200, y: 150 }, isMobile); // 보관함 1
    await placeBox(page, { x: 350, y: 250 }, { x: 500, y: 350 }, isMobile); // 보관함 2
    await openMainScene(page);
  });

  test("가구를 누르면 카메라가 그 가구 쪽으로 돌고, 확대 정도는 그대로다", async ({
    page,
    isMobile,
  }) => {
    const before = await labelGap(page);
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(resetView(page)).toBeEnabled();
    const after = await labelGap(page);
    // 같은 거리에서 돌기만 해도 보는 방향이 바뀌어 두 가구 사이가 약 1.5배 보인다(대각선 → 정면 쪽, 계산으로 확인).
    // 검색처럼 가구에 맞춰 당기면 약 4배가 되므로 2.2배 안이면 확대 정도는 그대로다
    expect(after / before).toBeLessThan(2.2);
  });

  test("가구 목록에서 골라도 카메라가 그 가구 쪽으로 돈다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휴대폰 목록은 3D 아래라 같은 동작을 위 테스트로 본다");
    await listButton(page, "보관함 2").click();
    await expect(detail(page).getByRole("heading", { name: "보관함 2" })).toBeVisible();
    await expect(resetView(page)).toBeEnabled();
  });

  test("엣지: 돌려 둔 뒤 같은 가구를 다시 누르거나 빈 곳을 눌러 닫아도 카메라는 그 자리다", async ({
    page,
    isMobile,
  }) => {
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await settledBox(boxLabel(page, "보관함 2")); // 옮겨 가기가 끝날 때까지
    const corner = await cornerPoint(page);
    await dragScreen(page, corner, { x: corner.x + DRAG_PX, y: corner.y }, isMobile); // 사용자가 돌려 둔다
    const turned = await labelOffset(page, "보관함 2");
    await pickBox(page, space3d(page), "보관함 1", isMobile); // 같은 가구: 화면은 다시 그려지지만 옮기지 않는다
    expectSameOffset(await labelOffset(page, "보관함 2"), turned);
    await pressScreen(page, await cornerPoint(page), isMobile); // 빈 곳: 패널이 닫힌다
    await expect(detail(page).getByRole("heading", { name: "가구" })).toBeVisible();
    expectSameOffset(await labelOffset(page, "보관함 2"), turned);
  });
});

test.describe("편집 모드 3D 미리보기", () => {
  test("엣지: 가구를 골라도 카메라를 옮기지 않는다", async ({ page, isMobile }) => {
    test.skip(isMobile, "휴대폰은 3D 미리보기에서 속성 패널이 숨는다");
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 50, y: 50 }, { x: 200, y: 150 }, isMobile); // 놓으면 골라진다
    await openPreview(page);
    await page.waitForTimeout(800);
    await expect(resetView(page)).toBeDisabled();
  });
});
