import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { addButton, addRoom, roomChip, rooms } from "./rooms";

const ACCENT = "rgb(168, 80, 27)"; // --yg-accent
const editInput = (page: Page) => page.getByRole("textbox", { name: "구역 이름", exact: true });
const removeButton = (page: Page) => page.getByRole("button", { name: "삭제" });
const undoButton = (page: Page) => page.getByRole("button", { name: "되돌리기" });

test.describe("구역 이름 바꾸기·삭제", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await addRoom(page, "안방");
    await addRoom(page, "거실");
  });

  test("칩을 누르면 고른 칩이 강조되고, 이름을 바꾸면 칩이 바뀐다", async ({ page }) => {
    const errors = collectErrors(page);
    await roomChip(page, "안방").click();
    await expect(roomChip(page, "안방")).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(0, 0); // 칩 위 올림 색이 아닌 고른 색을 본다
    await expect(roomChip(page, "안방")).toHaveCSS("background-color", ACCENT);
    await expect(roomChip(page, "거실")).toHaveAttribute("aria-pressed", "false");
    await expect(editInput(page)).toBeFocused();
    await expect(editInput(page)).toHaveValue("안방");
    await expect(removeButton(page)).toBeVisible();

    await editInput(page).fill("침실 ");
    await editInput(page).press("Enter");
    await expect(rooms(page)).toHaveText(["침실", "거실"]);
    await expect(editInput(page)).toHaveCount(0);
    await expect(roomChip(page, "침실")).toBeFocused();
    await expect(roomChip(page, "침실")).toHaveAttribute("aria-pressed", "false");

    await undoButton(page).click();
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
    expect(errors).toEqual([]);
  });

  test("삭제하면 칩이 사라지고, 되돌리기로 돌아온다", async ({ page }) => {
    await roomChip(page, "안방").click();
    await removeButton(page).click();
    await expect(rooms(page)).toHaveText(["거실"]);
    await expect(addButton(page)).toBeFocused();
    await undoButton(page).click();
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
  });

  test('엣지: 마지막 구역까지 지우면 목록이 비고 "+ 구역 추가"만 남는다', async ({ page }) => {
    for (const name of ["안방", "거실"]) {
      await roomChip(page, name).click();
      await removeButton(page).click();
    }
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
    await expect(addButton(page)).toBeVisible();
  });

  test("엣지: 다른 구역과 같은 이름·빈 이름은 막힌다", async ({ page }) => {
    await roomChip(page, "안방").click();
    await editInput(page).fill("거 실");
    await editInput(page).press("Enter");
    await expect(page.getByRole("alert")).toHaveText("이미 있는 구역 이름이에요");
    await editInput(page).fill("  ");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByRole("alert")).toHaveText("구역 이름을 써 주세요");
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
    await expect(roomChip(page, "안방")).toHaveAttribute("aria-pressed", "true");
  });

  test("엣지: 이름을 그대로 두고 확인하면 닫히고 되돌리기 기록도 늘지 않는다", async ({ page }) => {
    await roomChip(page, "안방").click();
    await editInput(page).press("Enter");
    await expect(editInput(page)).toHaveCount(0);
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
    await undoButton(page).click(); // 한 번이면 마지막에 더한 거실이 사라진다
    await expect(rooms(page)).toHaveText(["안방"]);
  });

  test("엣지: Esc·취소·고른 칩 다시 누르기는 바꾸지 않고 닫는다", async ({ page }) => {
    await roomChip(page, "안방").click();
    await editInput(page).fill("침실");
    await editInput(page).press("Escape");
    await expect(editInput(page)).toHaveCount(0);
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
    await expect(roomChip(page, "안방")).toBeFocused();
    await expect(roomChip(page, "안방")).toHaveAttribute("aria-pressed", "false");

    await roomChip(page, "거실").click();
    await expect(editInput(page)).toHaveValue("거실"); // 닫으면 쓴 글자도 지운다
    await page.getByRole("button", { name: "취소" }).click();
    await expect(editInput(page)).toHaveCount(0);

    await roomChip(page, "거실").click();
    await roomChip(page, "거실").click();
    await expect(editInput(page)).toHaveCount(0);
  });

  test("엣지: 다른 칩을 누르면 그 구역으로 바뀐다", async ({ page }) => {
    await roomChip(page, "안방").click();
    await editInput(page).fill("침실");
    await roomChip(page, "거실").click();
    await expect(editInput(page)).toHaveValue("거실");
    await expect(roomChip(page, "안방")).toHaveAttribute("aria-pressed", "false");
    await expect(roomChip(page, "거실")).toHaveAttribute("aria-pressed", "true");
  });

  test("엣지: 고르는 중에 되돌리기로 그 구역이 없어지면 입력칸이 닫힌다", async ({ page }) => {
    await roomChip(page, "거실").click();
    await undoButton(page).click();
    await expect(rooms(page)).toHaveText(["안방"]);
    await expect(editInput(page)).toHaveCount(0);
    await expect(addButton(page)).toBeVisible();
  });

  test("엣지: 키보드만으로 이름 바꾸기·삭제", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await roomChip(page, "안방").focus();
    await page.keyboard.press("Enter");
    await expect(editInput(page)).toBeFocused();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("침실");
    await page.keyboard.press("Enter");
    await expect(rooms(page)).toHaveText(["침실", "거실"]);

    await page.keyboard.press("Tab"); // 침실 칩 → 거실 칩
    await expect(roomChip(page, "거실")).toBeFocused();
    await page.keyboard.press("Enter");
    for (const name of ["확인", "취소", "삭제"]) {
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name })).toBeFocused();
    }
    await page.keyboard.press("Enter");
    await expect(rooms(page)).toHaveText(["침실"]);
  });

  test("엣지: 칩·삭제 버튼은 44px이고 360px에서 가로 스크롤이 없다", async ({ page }) => {
    await roomChip(page, "안방").click();
    for (const target of [roomChip(page, "안방"), removeButton(page)]) {
      expect((await target.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page }, testInfo) => {
    await roomChip(page, "안방").click();
    await page.mouse.move(0, 0); // 칩 위 올림 색이 찍히지 않게
    await page.screenshot({ path: testInfo.outputPath("room-edit.png"), fullPage: true });
  });
});
