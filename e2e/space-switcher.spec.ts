import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";

const pill = (page: Page, name = "내 방") =>
  page.getByRole("button", { name: `공간 ${name}`, exact: true });
const spaceList = (page: Page) => page.getByRole("region", { name: "공간 바꾸기" });
const spaceItem = (page: Page, name: string) =>
  spaceList(page).getByRole("button", { name: new RegExp(`^${name} `) });
const dialog = (page: Page) => page.getByRole("dialog", { name: "바닥 크기를 정해요" });
const mainTitle = (page: Page) => page.getByRole("heading", { level: 1, name: "요깃따" });

/** 새 공간을 만들고 [‹ 완료]로 메인 화면에 온다. */
async function openMain(page: Page) {
  await createSpace(page, { width: "6.0", depth: "4.5" });
  await page.getByRole("button", { name: "완료" }).click();
  await expect(mainTitle(page)).toBeVisible();
}
/** 목록의 "+ 새 공간 만들기"로 대화상자를 연다. */
async function openNewSpaceDialog(page: Page) {
  await pill(page).click();
  await spaceList(page).getByRole("button", { name: "새 공간 만들기" }).click();
  await expect(dialog(page)).toBeVisible();
}

test.describe("공간 전환 목록", () => {
  test.beforeEach(async ({ page }) => {
    await openMain(page);
  });

  test("알약을 누르면 목록이 열리고, 지금 공간이 강조·체크되며 초점을 받는다", async ({ page }) => {
    const errors = collectErrors(page);
    await expect(pill(page)).toHaveAttribute("aria-expanded", "false");
    await pill(page).click();
    await expect(pill(page)).toHaveAttribute("aria-expanded", "true");
    await expect(spaceItem(page, "내 방")).toHaveAccessibleName(
      "내 방 6.0 × 4.5 m · 가구 0 · 물건 0",
    );
    await expect(spaceItem(page, "내 방")).toHaveAttribute("aria-current", "true");
    await expect(spaceItem(page, "내 방")).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("+ 새 공간 만들기 → 대화상자 → 만들면 새 공간의 편집 모드, 완료하면 알약이 새 공간", async ({
    page,
  }) => {
    await openNewSpaceDialog(page);
    const name = dialog(page).getByLabel("공간 이름");
    await expect(name).toHaveValue("새 공간"); // "내 방"은 이미 있어서
    await expect(name).toBeFocused();
    await name.fill("형 방");
    await dialog(page).getByLabel("가로 (m)").fill("5.0");
    await dialog(page).getByLabel("세로 (m)").fill("5.0");
    await dialog(page).getByRole("button", { name: "벽 그리러 가기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
    await expect(page.getByText("형 방 · 5.0 × 5.0 m")).toBeVisible();
    await page.getByRole("button", { name: "완료" }).click();
    await pill(page, "형 방").click();
    await expect(spaceList(page).getByRole("listitem")).toHaveCount(2);
    await expect(spaceItem(page, "형 방")).toHaveAttribute("aria-current", "true");
  });

  test("엣지: Esc·알약 다시 누르기는 닫고 초점을 알약으로, 바깥 누르기도 닫는다", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await pill(page).click();
      await page.keyboard.press("Escape");
      await expect(spaceList(page)).toHaveCount(0);
      await expect(pill(page)).toBeFocused();
    }
    await pill(page).click();
    await pill(page).click();
    await expect(spaceList(page)).toHaveCount(0);
    await pill(page).click();
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    await page.mouse.click(viewport.width - 20, viewport.height - 20); // 목록 바깥 (3D 공간 아래쪽)
    await expect(spaceList(page)).toHaveCount(0);
  });

  test("엣지: 대화상자는 Esc·닫기·바깥 누르기로 취소되고, 공간은 늘지 않는다", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await openNewSpaceDialog(page);
      await page.keyboard.press("Escape");
      await expect(dialog(page)).toHaveCount(0);
      await expect(pill(page)).toBeFocused();
    }
    await openNewSpaceDialog(page);
    await dialog(page).getByRole("button", { name: "닫기" }).click();
    await expect(dialog(page)).toBeHidden();
    await openNewSpaceDialog(page);
    await page.mouse.click(5, 5); // 대화상자 바깥(뒤 배경)
    await expect(dialog(page)).toBeHidden();
    await pill(page).click();
    await expect(spaceList(page).getByRole("listitem")).toHaveCount(1);
  });

  test("엣지: 대화상자에서 같은 이름은 막히고 안내 문구가 나온다", async ({ page }) => {
    await openNewSpaceDialog(page);
    await dialog(page).getByLabel("공간 이름").fill(" 내 방 ");
    await expect(dialog(page).getByText("이미 같은 이름의 공간이 있어요")).toBeVisible();
    await expect(dialog(page).getByRole("button", { name: "벽 그리러 가기" })).toBeDisabled();
  });

  test("엣지: 목록과 대화상자가 화면 안에 있고 가로 스크롤이 없다", async ({ page }) => {
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    const inside = async (box: { x: number; width: number } | null) => {
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
    };
    await pill(page).click();
    await inside(await spaceList(page).boundingBox());
    await spaceList(page).getByRole("button", { name: "새 공간 만들기" }).click();
    await inside(await dialog(page).boundingBox());
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(viewport.width);
  });

  test("스크린샷을 남긴다 (시안 01과 비교)", async ({ page }, testInfo) => {
    await openNewSpaceDialog(page);
    await dialog(page).getByLabel("공간 이름").fill("형 방");
    await dialog(page).getByRole("button", { name: "벽 그리러 가기" }).click();
    await page.getByRole("button", { name: "완료" }).click();
    await pill(page, "형 방").click();
    await page.waitForTimeout(300); // 3D 공간이 그려질 때까지 (스크린샷용)
    await page.screenshot({ path: testInfo.outputPath("space-list.png"), fullPage: true });
    await spaceList(page).getByRole("button", { name: "새 공간 만들기" }).click();
    await page.screenshot({ path: testInfo.outputPath("new-space.png"), fullPage: true });
  });
});
