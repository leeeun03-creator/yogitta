import { expect, test } from "@playwright/test";
import { chooseTool, cmToScreen, createSpace, dragPath, pressCm } from "./helpers";
import { makeRoom, nameInput, roomAreas, roomChip, roomLabels, rooms, splitAt } from "./rooms";

const FLOOR = { w: 600, h: 450 };
const PEACH = "#F9D5C2"; // 첫 구역 색 (yogitta-design 6장)
const MINT = "#CDEBD9"; // 두 번째 구역 색

test.describe("구역 칠하기가 벽·구역 선을 따라간다", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await splitAt(page, [300], isMobile);
    await makeRoom(page, "안방", { x: 150, y: 200 }, isMobile);
    await makeRoom(page, "거실", { x: 450, y: 200 }, isMobile);
  });

  test("구역 목록 순서대로 파스텔 색을 칠하고, 누른 자리에 이름을 쓴다", async ({ page }) => {
    await expect(roomAreas(page).nth(0)).toHaveAttribute("fill", PEACH);
    await expect(roomAreas(page).nth(1)).toHaveAttribute("fill", MINT);
    const label = await roomLabels(page).first().boundingBox();
    const at = await cmToScreen(page, FLOOR, { x: 150, y: 200 });
    expect(Math.abs((label?.x ?? 0) + (label?.width ?? 0) / 2 - at.x)).toBeLessThanOrEqual(2);
  });

  test("가르던 구역 선을 지우면 먼저 만든 구역만 보이고, 되돌리면 다시 나뉜다", async ({
    page,
    isMobile,
  }) => {
    await chooseTool(page, "지우개");
    await pressCm(page, FLOOR, [{ x: 300, y: 225 }], isMobile);
    await expect(roomLabels(page)).toHaveText(["안방"]);
    await expect(rooms(page)).toHaveText(["안방", "거실"]); // 구역 목록은 그대로
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(roomLabels(page)).toHaveText(["안방", "거실"]);
  });

  test("구역 안에 벽을 두르면 그 안은 이름 없는 구획이 된다", async ({ page, isMobile }) => {
    await chooseTool(page, "사각형");
    const [a, b] = await Promise.all(
      [
        { x: 350, y: 250 },
        { x: 550, y: 400 },
      ].map((point) => cmToScreen(page, FLOOR, point)),
    );
    if (a && b) await dragPath(page, [a, b], isMobile);
    await chooseTool(page, "선택");
    await pressCm(page, FLOOR, [{ x: 450, y: 325 }], isMobile);
    await expect(nameInput(page)).toBeVisible();
    await nameInput(page).fill("옷방");
    await nameInput(page).press("Enter");
    await expect(roomLabels(page)).toHaveText(["안방", "거실", "옷방"]);
  });

  test("엣지: 구역을 지우면 그 구획 색이 사라지고 이름 없는 구획이 된다", async ({
    page,
    isMobile,
  }) => {
    await roomChip(page, "거실").click();
    await page.getByRole("button", { name: "삭제" }).click();
    await expect(roomAreas(page)).toHaveCount(1);
    await pressCm(page, FLOOR, [{ x: 450, y: 200 }], isMobile);
    await expect(nameInput(page)).toBeVisible();
  });

  test("엣지: 도구를 바꾸면 열린 이름 입력칸이 닫힌다", async ({ page, isMobile }) => {
    await roomChip(page, "거실").click();
    await page.getByRole("button", { name: "삭제" }).click();
    await pressCm(page, FLOOR, [{ x: 450, y: 200 }], isMobile);
    await expect(nameInput(page)).toBeVisible();
    await chooseTool(page, "직선");
    await expect(nameInput(page)).toHaveCount(0);
  });

  test("스크린샷을 남긴다 (시안 04와 비교)", async ({ page, isMobile }, testInfo) => {
    await pressCm(page, FLOOR, [{ x: 450, y: 300 }], isMobile); // 거실 고르기
    await page.mouse.move(0, 0);
    await page.screenshot({ path: testInfo.outputPath("room-area.png"), fullPage: true });
  });
});
