import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, plan, pressScreen } from "./helpers";
import { boxButton, expectBox, nameField, panel, placeBox } from "./boxes";

const rotateButton = (page: Page) => panel(page).getByRole("button", { name: "90° 회전" });
const removeButton = (page: Page) => panel(page).getByRole("button", { name: "삭제" });
const planRegion = (page: Page) => page.getByRole("region", { name: "2D 평면도 영역" });

test.describe("가구 돌리기·지우기 (속성 패널)", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("가구를 고르면 속성 패널에 이름·크기·[90° 회전]·[삭제]가 보인다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await expect(nameField(page)).toHaveValue("보관함 1");
    await expect(panel(page).getByText("200 × 150 × 90 cm")).toBeVisible();
    await expect(rotateButton(page)).toBeEnabled();
    await expect(removeButton(page)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("[90° 회전]을 누르면 시계 방향 90도 돌고 정면 삼각형이 왼쪽으로 간다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await rotateButton(page).click();
    await expectBox(page, [200, 125, 200, 150, 90]);
    const front = await plan(page).getByTestId("box-front").boundingBox();
    const body = await boxButton(page, "보관함 1").boundingBox();
    expect((front?.x ?? 0) + (front?.width ?? 0)).toBeLessThanOrEqual((body?.x ?? 0) + 1);
    // 돌린 모양(세로로 긴 150 × 200)대로 가구 버튼도 바뀐다
    expect(body?.height ?? 0).toBeGreaterThan(body?.width ?? 0);
  });

  test("네 번 돌리면 처음이고, 되돌리기 한 번에 한 번 돌리기 전이다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    for (let turn = 0; turn < 4; turn++) await rotateButton(page).click();
    await expectBox(page, [200, 125, 200, 150, 0]);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expectBox(page, [200, 125, 200, 150, 270]);
  });

  test("[삭제]를 누르면 지워지고 패널이 닫히며, 되돌리면 다시 보인다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await removeButton(page).click();
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
    await expect(nameField(page)).toHaveCount(0);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(plan(page)).toHaveAccessibleName(/가구 1개$/);
    await expect(plan(page).getByText("보관함 1", { exact: true })).toBeVisible();
  });

  test("회전 핸들(정면 반대쪽 동그라미)을 누르면 돈다", async ({ page, isMobile }) => {
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    const handle = async () => {
      const box = await plan(page).getByTestId("rotate-handle").locator("circle").boundingBox();
      if (!box) throw new Error("회전 핸들이 없다");
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    await pressScreen(page, await handle(), isMobile); // 0도: 위쪽
    await expectBox(page, [200, 125, 200, 150, 90]);
    await pressScreen(page, await handle(), isMobile); // 90도: 오른쪽
    await expectBox(page, [200, 125, 200, 150, 180]);
    await expect(boxButton(page, "보관함 1")).toHaveAttribute("aria-pressed", "true");
  });

  test("엣지: 바닥 경계에 붙은 가구를 돌리면 바닥 안으로 밀린다", async ({ page, isMobile }) => {
    await placeBox(page, { x: 100, y: 400 }, { x: 400, y: 450 }, isMobile); // 300 × 50, 아래 끝
    await rotateButton(page).click();
    await expectBox(page, [250, 300, 300, 50, 90]);
  });

  test("엣지: 바닥보다 길어 못 돌리면 버튼이 막히고 까닭이 나온다 (R 키도 안 돈다)", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 50, y: 100 }, { x: 550, y: 150 }, isMobile); // 500 × 50, 세로 4.5 m
    await expect(rotateButton(page)).toBeDisabled();
    await expect(rotateButton(page)).toHaveAccessibleDescription("바닥보다 길어서 돌릴 수 없어요");
    if (!isMobile) {
      await page.getByLabel(/^2D 평면도 보기/).focus();
      await page.keyboard.press("r");
      await expectBox(page, [300, 125, 500, 50, 0]);
    }
  });

  test("엣지: 키보드만으로 가구에 가서 R로 돌리고 Delete로 지운다 (초점은 2D 평면도로)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, false);
    await page.getByLabel(/^2D 평면도 보기/).focus();
    await page.keyboard.press("r"); // 2D 평면도에 초점: 고른 가구를 돌린다
    await expectBox(page, [200, 125, 200, 150, 90]);
    await page.keyboard.press("Tab");
    await expect(boxButton(page, "보관함 1")).toBeFocused();
    await page.keyboard.press("r"); // 가구 버튼에 초점: 그 가구를 돌린다
    await expectBox(page, [200, 125, 200, 150, 180]);
    await page.keyboard.press("Delete");
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
    await expect(page.getByLabel(/^2D 평면도 보기/)).toBeFocused();
  });

  test("엣지: 지우개로 가구를 누르면 지운다 (올리면 지울 가구가 보인다)", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await chooseTool(page, "지우개");
    // 가구 버튼은 선택 도구에서만 있으니 2D 평면도의 가구 모양 자리를 쓴다
    const body = await plan(page).getByTestId("box").locator("rect").boundingBox();
    const center = { x: (body?.x ?? 0) + (body?.width ?? 0) / 2, y: (body?.y ?? 0) + 20 };
    if (!isMobile) {
      await page.mouse.move(center.x, center.y);
      await expect(plan(page).getByTestId("box").locator("rect")).toHaveCSS(
        "stroke",
        "rgb(155, 44, 31)", // --yg-danger
      );
    }
    await pressScreen(page, center, isMobile);
    await expect(plan(page)).toHaveAccessibleName(/가구 0개$/);
  });

  test("엣지: 가구를 고르고 풀어도 2D 평면도 크기가 그대로다 (화면이 흔들리지 않는다)", async ({
    page,
    isMobile,
  }) => {
    const before = await planRegion(page).boundingBox();
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    await expect(nameField(page)).toHaveValue("보관함 1");
    expect(await planRegion(page).boundingBox()).toEqual(before);
  });

  test("엣지: 고른 가구가 없으면 데스크톱은 안내, 휴대폰은 패널이 없다", async ({
    page,
    isMobile,
  }) => {
    const guide = page.getByText("가구를 누르면 여기서 종류를 바꾸거나 돌리고 지울 수 있어요");
    if (isMobile) await expect(guide).toBeHidden();
    else await expect(guide).toBeVisible();
  });

  test("엣지: 360px에서 속성 패널이 화면 안에 겹쳐 뜨고 버튼이 44px이다", async ({
    page,
    isMobile,
  }, testInfo) => {
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile);
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    const box = await panel(page).boundingBox();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
    expect((await rotateButton(page).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    await page.waitForTimeout(300); // 도구 막대 바탕색이 바뀌는 동안을 기다린다 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("property-panel.png"), fullPage: true });
  });
});
