import { expect, test, type Locator, type Page } from "@playwright/test";
import { collectErrors, createSpace, openPreview, preview } from "./helpers";
import { drawWall, panel as propertyPanel, placeBox } from "./boxes";
import { finishEditing } from "./spaces";

const detail = (page: Page) => page.getByRole("complementary", { name: "가구 상세 패널" });
const space3d = (page: Page) => page.getByRole("img", { name: /^3D 공간,/ });

/** 라벨이 멈출 때까지(연달아 잰 자리가 같을 때까지) 기다린 뒤 자리를 돌려준다. */
async function settledBox(label: Locator) {
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
async function pickBox(page: Page, root: Locator, name: string, isMobile: boolean, below = 30) {
  const label = await settledBox(root.getByTestId("box-label").filter({ hasText: name }));
  const point = {
    x: (label?.x ?? 0) + (label?.width ?? 0) / 2,
    y: (label?.y ?? 0) + (label?.height ?? 0) / 2 + below,
  };
  if (isMobile) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

/** 메인 화면으로 돌아가 3D 카메라가 자리를 잡을 때까지(확대 버튼이 풀림) 기다린다. 그 전에는 라벨 자리가 아직 움직인다. */
async function openMainScene(page: Page) {
  await finishEditing(page);
  await expect(page.getByRole("button", { name: "확대" })).toBeEnabled();
}

test.describe("3D에서 가구를 눌러 가구 상세 패널 열기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 50, y: 50 }, { x: 200, y: 150 }, isMobile); // 보관함 1
    await placeBox(page, { x: 350, y: 250 }, { x: 500, y: 350 }, isMobile); // 보관함 2
  });

  test("가구를 누르면 그 가구의 가구 상세 패널이 열리고, 다른 가구를 누르면 바뀐다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await openMainScene(page);
    await expect(space3d(page).getByTestId("box-label")).toHaveCount(2);
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(detail(page).getByRole("heading", { name: "보관함 1" })).toBeVisible();
    await pickBox(page, space3d(page), "보관함 2", isMobile);
    await expect(detail(page).getByRole("heading", { name: "보관함 2" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("엣지: 이름 라벨을 눌러도 그 가구가 열린다", async ({ page, isMobile }) => {
    // 깊이 15cm짜리 얇은 가구는 라벨 뒤로 가구 윗면이 없어(바닥만 보인다) 라벨로만 눌린다
    await placeBox(page, { x: 350, y: 60 }, { x: 500, y: 75 }, isMobile); // 보관함 3
    await openMainScene(page);
    await pickBox(page, space3d(page), "보관함 3", isMobile, 0);
    await expect(detail(page).getByRole("heading", { name: "보관함 3" })).toBeVisible();
  });

  test("엣지: 벽 너머에 있는 가구도 눌린다 (벽은 누르기 판정에서 뺀다)", async ({
    page,
    isMobile,
  }) => {
    // 카메라는 바닥 오른쪽 아래 위에서 보므로 보관함 1의 앞(아래쪽)에 벽을 세우면 벽이 가구를 가린다
    await drawWall(page, { x: 20, y: 180 }, { x: 260, y: 180 }, isMobile);
    await openMainScene(page);
    await pickBox(page, space3d(page), "보관함 1", isMobile);
    await expect(detail(page).getByRole("heading", { name: "보관함 1" })).toBeVisible();
  });

  test("엣지: 편집 모드 3D 미리보기에서는 가구를 눌러도 아무것도 바뀌지 않는다", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "휴대폰은 3D 미리보기에서 속성 패널이 숨는다");
    await page
      .getByRole("toolbar", { name: "그리기 도구" })
      .getByRole("button", { name: "직선" })
      .click(); // 고른 가구를 푼다
    await openPreview(page);
    await pickBox(page, preview(page), "보관함 1", isMobile);
    await expect(propertyPanel(page)).toContainText("가구를 누르면 여기서");
  });
});
