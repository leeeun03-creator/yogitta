import { expect, test, type Page } from "@playwright/test";
import { chooseTool, collectErrors, createSpace, dragFloorCm, pressCm } from "./helpers";
import { makeRoom, splitAt } from "./rooms";

const FLOOR = { w: 600, h: 450 };
type Cm = { x: number; y: number };

const panel = (page: Page) => page.getByRole("complementary", { name: "속성 패널" });
const roomText = (page: Page) => panel(page).getByText(/^구역 /);
const editInput = (page: Page) => page.getByRole("textbox", { name: "구역 이름", exact: true });

/** 가구 도구로 끌어 놓는다 (놓으면 그 가구가 골라진다). */
async function placeBox(page: Page, from: Cm, to: Cm, isMobile: boolean) {
  await chooseTool(page, "가구");
  await dragFloorCm(page, FLOOR, from, to, isMobile);
}

test.describe("가구가 놓인 구역", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await splitAt(page, [300], isMobile); // 왼쪽·오른쪽 구획
    await makeRoom(page, "안방", { x: 150, y: 400 }, isMobile); // 왼쪽만 구역
  });

  test("구역이 있는 구획에 놓으면 속성 패널에 그 구역, 없는 구획이면 '구역 없음'", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await placeBox(page, { x: 100, y: 100 }, { x: 200, y: 200 }, isMobile);
    await expect(roomText(page)).toHaveText("구역 안방");
    await placeBox(page, { x: 400, y: 100 }, { x: 500, y: 200 }, isMobile);
    await expect(roomText(page)).toHaveText("구역 없음");
    expect(errors).toEqual([]);
  });

  test("엣지: 다른 구역으로 옮기면 바뀌고, 되돌리면 돌아온다", async ({ page, isMobile }) => {
    await makeRoom(page, "거실", { x: 450, y: 400 }, isMobile);
    await placeBox(page, { x: 100, y: 100 }, { x: 200, y: 200 }, isMobile);
    await dragFloorCm(page, FLOOR, { x: 150, y: 150 }, { x: 450, y: 150 }, isMobile);
    await expect(roomText(page)).toHaveText("구역 거실");
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(roomText(page)).toHaveText("구역 안방");
  });

  test("엣지: 구역 이름을 바꾸면 따라가고, 구역을 지우면 '구역 없음'이 된다", async ({
    page,
    isMobile,
  }) => {
    await placeBox(page, { x: 100, y: 100 }, { x: 200, y: 200 }, isMobile);
    // 빈 곳(구역 안방)을 누르면 가구는 풀리고 구역 이름 입력칸이 열린다
    await pressCm(page, FLOOR, [{ x: 50, y: 400 }], isMobile);
    await editInput(page).fill("큰방");
    await editInput(page).press("Enter");
    await pressCm(page, FLOOR, [{ x: 150, y: 150 }], isMobile);
    await expect(roomText(page)).toHaveText("구역 큰방");
    await pressCm(page, FLOOR, [{ x: 50, y: 400 }], isMobile);
    await page.getByRole("button", { name: "삭제" }).click();
    await pressCm(page, FLOOR, [{ x: 150, y: 150 }], isMobile);
    await expect(roomText(page)).toHaveText("구역 없음");
  });

  test("엣지: 가구를 놓은 뒤 구역 선을 그어 구역을 만들면 따라간다", async ({ page, isMobile }) => {
    await placeBox(page, { x: 400, y: 50 }, { x: 460, y: 100 }, isMobile); // 오른쪽 위
    await expect(roomText(page)).toHaveText("구역 없음");
    await chooseTool(page, "구역 선");
    await dragFloorCm(page, FLOOR, { x: 300, y: 200 }, { x: 600, y: 200 }, isMobile); // 오른쪽을 위·아래로
    await chooseTool(page, "선택");
    await makeRoom(page, "옷방", { x: 550, y: 150 }, isMobile);
    await pressCm(page, FLOOR, [{ x: 430, y: 75 }], isMobile);
    await expect(roomText(page)).toHaveText("구역 옷방");
  });

  test("엣지: 가운데가 구역 선 위여도 한쪽 구역으로 본다", async ({ page, isMobile }) => {
    await makeRoom(page, "거실", { x: 450, y: 400 }, isMobile);
    await placeBox(page, { x: 250, y: 100 }, { x: 350, y: 200 }, isMobile); // 가운데 x = 300
    await expect(roomText(page)).toHaveText(/^구역 (안방|거실)$/);
  });
});
