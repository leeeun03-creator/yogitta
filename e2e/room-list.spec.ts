import { expect, test } from "@playwright/test";
import { collectErrors, createSpace, plan, pressCm } from "./helpers";
import { makeRoom, nameInput, roomAreas, roomLabels, rooms, splitAt } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const LEFT = { x: 150, y: 200 };
const RIGHT = { x: 450, y: 200 };

test.describe("구획을 눌러 구역 만들기", () => {
  test.beforeEach(async ({ page }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
  });

  test("엣지: 구역 0개면 라벨과 만드는 법 안내만 있다", async ({ page }) => {
    const area = page.getByRole("region", { name: "2D 평면도 영역" });
    await expect(area.getByText("구역", { exact: true })).toBeVisible();
    await expect(area.getByText("구역 선으로 나눈 바닥을 누르면 구역이 생겨요")).toBeVisible();
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "+ 구역 추가" })).toHaveCount(0);
  });

  test("이름 없는 구획을 누르면 그 자리에 입력칸이 뜨고, Enter로 구역이 생긴다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await pressCm(page, FLOOR, [LEFT], isMobile);
    await expect(nameInput(page)).toBeFocused();
    await nameInput(page).fill(" 안방 ");
    await nameInput(page).press("Enter");
    await expect(nameInput(page)).toHaveCount(0);
    await expect(rooms(page)).toHaveText(["안방"]);
    await expect(roomAreas(page)).toHaveCount(1);
    await expect(roomLabels(page)).toHaveText(["안방"]);
    await expect(page.getByLabel(/^2D 평면도 보기/)).toBeFocused();

    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
    await expect(roomAreas(page)).toHaveCount(0);
    await page.getByRole("button", { name: "다시하기" }).click();
    await expect(rooms(page)).toHaveText(["안방"]);
    expect(errors).toEqual([]);
  });

  test("확인 버튼으로도 만들고, 나뉜 구획마다 따로 구역이 된다", async ({ page, isMobile }) => {
    await splitAt(page, [300], isMobile);
    await makeRoom(page, "안방", LEFT, isMobile);
    await pressCm(page, FLOOR, [RIGHT], isMobile);
    await nameInput(page).fill("거실");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(rooms(page)).toHaveText(["안방", "거실"]);
    await expect(roomAreas(page)).toHaveCount(2);
  });

  test("엣지: 입력 중 Ctrl+Z는 글자만 되돌리고 구역은 그대로다", async ({ page, isMobile }) => {
    await splitAt(page, [300], isMobile);
    await makeRoom(page, "안방", LEFT, isMobile);
    await pressCm(page, FLOOR, [RIGHT], isMobile);
    await nameInput(page).pressSequentially("거실");
    await nameInput(page).press("Control+z");
    await expect(rooms(page)).toHaveText(["안방"]);
    await expect(nameInput(page)).toBeVisible();
  });

  test("엣지: 빈 이름·공백만은 막히고 안내 문구가 나온다, 고치면 문구가 사라진다", async ({
    page,
    isMobile,
  }) => {
    await pressCm(page, FLOOR, [LEFT], isMobile);
    for (const name of ["", "   "]) {
      await nameInput(page).fill(name);
      await nameInput(page).press("Enter");
      await expect(page.getByRole("alert")).toHaveText("구역 이름을 써 주세요");
      await expect(nameInput(page)).toHaveAttribute("aria-invalid", "true");
    }
    await nameInput(page).fill("안방");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
  });

  test("엣지: 같은 이름(띄어쓰기·대소문자만 다른 것도)은 막힌다", async ({ page, isMobile }) => {
    await splitAt(page, [200, 400], isMobile);
    await makeRoom(page, "안방", { x: 100, y: 200 }, isMobile);
    await makeRoom(page, "Room A", { x: 300, y: 200 }, isMobile);
    await pressCm(page, FLOOR, [{ x: 500, y: 200 }], isMobile);
    for (const name of ["안방", "안 방", "room a"]) {
      await nameInput(page).fill(name);
      await nameInput(page).press("Enter");
      await expect(page.getByRole("alert")).toHaveText("이미 있는 구역 이름이에요");
    }
    await expect(rooms(page)).toHaveText(["안방", "Room A"]);
  });

  test("엣지: 10자 넘게 쓸 수 없다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [LEFT], isMobile);
    await nameInput(page).pressSequentially("가나다라마바사아자차카타");
    await expect(nameInput(page)).toHaveValue("가나다라마바사아자차");
  });

  test("엣지: Esc·취소는 만들지 않고 닫는다", async ({ page, isMobile }) => {
    await pressCm(page, FLOOR, [LEFT], isMobile);
    await nameInput(page).fill("안방");
    await nameInput(page).press("Escape");
    await expect(nameInput(page)).toHaveCount(0);
    await pressCm(page, FLOOR, [LEFT], isMobile);
    await expect(nameInput(page)).toHaveValue(""); // 닫으면 쓴 글자도 지운다
    await page.getByRole("button", { name: "취소" }).click();
    await expect(nameInput(page)).toHaveCount(0);
    await expect(page.getByRole("list", { name: "구역" })).toHaveCount(0);
  });

  test("엣지: 벽·구역 선 위나 바닥 밖을 누르면 입력칸이 뜨지 않는다", async ({
    page,
    isMobile,
  }) => {
    await splitAt(page, [300], isMobile);
    await pressCm(page, FLOOR, [{ x: 300, y: 200 }], isMobile);
    await expect(nameInput(page)).toHaveCount(0);
    await pressCm(page, FLOOR, [{ x: 300, y: -30 }], isMobile);
    await expect(nameInput(page)).toHaveCount(0);
  });

  test("엣지: 선택 도구가 아니면 바닥을 눌러도 입력칸이 뜨지 않는다", async ({
    page,
    isMobile,
  }) => {
    const bar = page.getByRole("toolbar", { name: "그리기 도구" });
    await bar.getByRole("button", { name: "지우개" }).click();
    await pressCm(page, FLOOR, [LEFT], isMobile);
    await expect(nameInput(page)).toHaveCount(0);
  });

  test("엣지: 키보드로 이름을 쓰고 Tab·Enter로 만든다", async ({ page, isMobile }) => {
    test.skip(isMobile, "키보드는 데스크톱에서만");
    await pressCm(page, FLOOR, [LEFT], false);
    await page.keyboard.type("안방");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "확인" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(rooms(page)).toHaveText(["안방"]);
  });

  test("엣지: 바닥 가장자리를 눌러도 입력칸이 2D 평면도 안에 뜬다", async ({ page, isMobile }) => {
    const wrapper = await page.getByLabel(/^2D 평면도 보기/).boundingBox();
    const right = (wrapper?.x ?? 0) + (wrapper?.width ?? 0);
    const bottom = (wrapper?.y ?? 0) + (wrapper?.height ?? 0);
    for (const at of [
      { x: 590, y: 440 },
      { x: 10, y: 10 },
    ]) {
      await pressCm(page, FLOOR, [at], isMobile);
      const box = await nameInput(page).boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(wrapper?.x ?? 0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(right);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(bottom);
      await nameInput(page).press("Escape");
    }
  });

  test("엣지: 구역이 많으면 칩이 줄바꿈되고 가로 스크롤이 없다, 7번째부터 색이 다시 돈다", async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(90_000); // 구역 선 11개 + 구역 12개를 만든다
    const xs = Array.from({ length: 11 }, (_, index) => 50 * (index + 1));
    await splitAt(page, xs, isMobile);
    const names = Array.from({ length: 12 }, (_, index) => `수납구역${index + 1}`);
    for (const [index, name] of names.entries()) {
      await makeRoom(page, name, { x: 25 + 50 * index, y: 200 }, isMobile);
    }
    await expect(rooms(page)).toHaveText(names);
    const first = await rooms(page).first().boundingBox();
    const last = await rooms(page).last().boundingBox();
    expect(last?.y).toBeGreaterThan(first?.y ?? 0);
    expect(first?.height).toBeGreaterThanOrEqual(44);
    const fill = (index: number) => roomAreas(page).nth(index).getAttribute("fill");
    expect(await fill(6)).toBe(await fill(0));
    expect(await fill(1)).not.toBe(await fill(0));
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
    await expect(plan(page)).toBeVisible();
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await splitAt(page, [300], isMobile);
    await makeRoom(page, "안방", RIGHT, isMobile);
    await makeRoom(page, "거실", LEFT, isMobile);
    await page.screenshot({ path: testInfo.outputPath("room-list.png"), fullPage: true });
  });
});
