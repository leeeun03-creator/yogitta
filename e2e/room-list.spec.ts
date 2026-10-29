import { expect, test } from "@playwright/test";
import { collectErrors, createSpace } from "./helpers";
import { addButton, addRoom, nameInput, rooms } from "./rooms";

test.describe("구역 목록과 구역 추가", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test('엣지: 구역 0개면 라벨과 "+ 구역 추가"만 있다', async ({ page }) => {
    const area = page.getByRole("region", { name: "2D 평면도 영역" });
    await expect(area.getByText("구역", { exact: true })).toBeVisible();
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
    await expect(addButton(page)).toBeVisible();
    await expect(nameInput(page)).toHaveCount(0);
  });

  test("Enter와 확인으로 더하면 칩이 생기고, 되돌리기로 사라진다", async ({ page }) => {
    const errors = collectErrors(page);
    await addButton(page).click();
    await expect(nameInput(page)).toBeFocused();
    await nameInput(page).fill("안방");
    await nameInput(page).press("Enter");
    await expect(rooms(page)).toHaveText(["안방"]);
    await expect(nameInput(page)).toHaveCount(0);
    await expect(addButton(page)).toBeFocused();

    await addButton(page).click();
    await nameInput(page).fill("  거실 ");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(rooms(page)).toHaveText(["안방", "거실"]); // 앞뒤 공백은 지운다

    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(rooms(page)).toHaveText(["안방"]);
    await page.getByRole("button", { name: "다시하기" }).click();
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
    expect(errors).toEqual([]);
  });

  test("엣지: 입력 중 Ctrl+Z는 글자만 되돌리고 구역은 그대로다", async ({ page }) => {
    await addRoom(page, "안방");
    await addButton(page).click();
    await nameInput(page).pressSequentially("거실");
    await nameInput(page).press("Control+z");
    await expect(rooms(page)).toHaveText(["안방"]);
    await expect(nameInput(page)).toBeVisible();
  });

  test("엣지: 빈 이름·공백만은 막히고 안내 문구가 나온다, 고치면 문구가 사라진다", async ({
    page,
  }) => {
    await addButton(page).click();
    for (const name of ["", "   "]) {
      await nameInput(page).fill(name);
      await nameInput(page).press("Enter");
      await expect(page.getByRole("alert")).toHaveText("구역 이름을 써 주세요");
      await expect(nameInput(page)).toHaveAttribute("aria-invalid", "true");
      await expect(nameInput(page)).toHaveAccessibleDescription("구역 이름을 써 주세요");
    }
    await nameInput(page).fill("안방");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
  });

  test("엣지: 같은 이름(띄어쓰기·대소문자만 다른 것도)은 막힌다", async ({ page }) => {
    await addRoom(page, "안방");
    await addRoom(page, "Room A");
    await addButton(page).click();
    for (const name of ["안방", "안 방", "room a"]) {
      await nameInput(page).fill(name);
      await nameInput(page).press("Enter");
      await expect(page.getByRole("alert")).toHaveText("이미 있는 구역 이름이에요");
    }
    await expect(rooms(page)).toHaveText(["안방", "Room A"]);
  });

  test("엣지: 10자 넘게 쓸 수 없다", async ({ page }) => {
    await addButton(page).click();
    await nameInput(page).pressSequentially("가나다라마바사아자차카타");
    await expect(nameInput(page)).toHaveValue("가나다라마바사아자차");
    await nameInput(page).press("Enter");
    await expect(rooms(page)).toHaveText(["가나다라마바사아자차"]);
  });

  test("엣지: Esc와 취소는 더하지 않고 닫는다", async ({ page }) => {
    await addButton(page).click();
    await nameInput(page).fill("안방");
    await nameInput(page).press("Escape");
    await expect(nameInput(page)).toHaveCount(0);
    await expect(addButton(page)).toBeFocused();

    await addButton(page).click();
    await expect(nameInput(page)).toHaveValue(""); // 닫으면 쓴 글자도 지운다
    await nameInput(page).fill("거실");
    await page.getByRole("button", { name: "취소" }).click();
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
  });

  test("엣지: 키보드만으로 이어서 더할 수 있다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await addButton(page).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.type("안방");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter"); // 초점이 "+ 구역 추가"로 돌아와 있다
    await page.keyboard.type("거실");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "확인" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
  });

  test("엣지: 구역이 많으면 줄바꿈되고 가로 스크롤이 없다, 칩·버튼은 44px", async ({ page }) => {
    const names = Array.from({ length: 12 }, (_, index) => `수납구역${index + 1}`);
    for (const name of names) await addRoom(page, name);
    await expect(rooms(page)).toHaveText(names);

    const first = await rooms(page).first().boundingBox();
    const last = await rooms(page).last().boundingBox();
    expect(last?.y).toBeGreaterThan(first?.y ?? 0);
    // "구역" 라벨과 첫 칩은 같은 줄에 있다 (목록이 좁게 끼어 흩어지지 않게)
    const label = await page
      .getByRole("region", { name: "2D 평면도 영역" })
      .getByText("구역", { exact: true })
      .boundingBox();
    const middle = (box: typeof label) => (box?.y ?? 0) + (box?.height ?? 0) / 2;
    expect(Math.abs(middle(label) - middle(first))).toBeLessThanOrEqual(2);
    for (const target of [rooms(page).first(), addButton(page)]) {
      expect((await target.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
    // 2D 평면도는 줄어도 남아 있고, 격자 스냅도 영역 안에 있다
    const area = await page.getByRole("region", { name: "2D 평면도 영역" }).boundingBox();
    const toggle = await page.getByRole("switch", { name: "격자 스냅" }).boundingBox();
    expect((toggle?.y ?? 0) + (toggle?.height ?? 0)).toBeLessThanOrEqual(
      (area?.y ?? 0) + (area?.height ?? 0),
    );
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page }, testInfo) => {
    await addRoom(page, "안방");
    await addRoom(page, "거실");
    await addButton(page).click();
    await nameInput(page).fill("거실");
    await nameInput(page).press("Enter");
    await expect(page.getByRole("alert")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("room-list.png"), fullPage: true });
  });
});
