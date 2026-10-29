import { expect, test, type Page } from "@playwright/test";
import { chooseTool, pressCm } from "./helpers";
import { dragCm } from "./rooms";
import { addSpaceFromList, finishEditing, openMain, pill, spaceItem } from "./spaces";

const FLOOR = { w: 600, h: 450 };
const THUMBNAIL = { width: 76, height: 56 }; // 시안 01

const thumbnail = (page: Page, name: string) =>
  spaceItem(page, name).getByTestId("space-thumbnail");
const wallFaces = (page: Page, name: string) => thumbnail(page, name).getByTestId("thumbnail-wall");

test.describe("공간 썸네일", () => {
  test("공간마다 76 × 56 썸네일이 있고, 벽 선분 수만큼 벽 면이 선다", async ({
    page,
    isMobile,
  }) => {
    await openMain(page);
    await addSpaceFromList(page, "형 방");
    await chooseTool(page, "사각형");
    await dragCm(
      page,
      [
        { x: 0, y: 0 },
        { x: 600, y: 450 },
      ],
      isMobile,
    );
    await chooseTool(page, "직선");
    const ends = [
      { x: 300, y: 0 },
      { x: 300, y: 450 },
    ];
    await pressCm(page, FLOOR, ends, isMobile);
    await finishEditing(page);
    await pill(page, "형 방").click();
    await expect(wallFaces(page, "형 방")).toHaveCount(5); // 사각형 4 + 직선 1
    await expect(wallFaces(page, "내 방")).toHaveCount(0); // 엣지: 벽 없는 공간은 바닥만
    const box = await thumbnail(page, "형 방").boundingBox();
    expect(box?.width).toBe(THUMBNAIL.width);
    expect(box?.height).toBe(THUMBNAIL.height);
  });

  test("엣지: 아주 길쭉한 바닥(30 × 1 m)도 썸네일 안에 들어간다", async ({ page }) => {
    await openMain(page);
    await pill(page).click();
    await page.getByRole("button", { name: "새 공간 만들기" }).click();
    const dialog = page.getByRole("dialog", { name: "바닥 크기를 정해요" });
    await dialog.getByLabel("공간 이름").fill("복도");
    await dialog.getByLabel("가로 (m)").fill("30");
    await dialog.getByLabel("세로 (m)").fill("1");
    await dialog.getByRole("button", { name: "벽 그리러 가기" }).click();
    await finishEditing(page);
    await pill(page, "복도").click();
    const frame = await thumbnail(page, "복도").boundingBox();
    const floor = await thumbnail(page, "복도").locator("polygon").first().boundingBox();
    expect(floor?.x ?? -1).toBeGreaterThanOrEqual(frame?.x ?? 0);
    expect((floor?.x ?? 0) + (floor?.width ?? 0)).toBeLessThanOrEqual(
      (frame?.x ?? 0) + (frame?.width ?? 0),
    );
    expect(floor?.y ?? -1).toBeGreaterThanOrEqual(frame?.y ?? 0);
    expect((floor?.y ?? 0) + (floor?.height ?? 0)).toBeLessThanOrEqual(
      (frame?.y ?? 0) + (frame?.height ?? 0),
    );
  });

  test("스크린샷을 남긴다 (시안 01과 비교)", async ({ page, isMobile }, testInfo) => {
    await openMain(page);
    await page.getByRole("button", { name: "편집" }).click();
    await chooseTool(page, "사각형");
    await dragCm(
      page,
      [
        { x: 0, y: 0 },
        { x: 600, y: 450 },
      ],
      isMobile,
    );
    await finishEditing(page);
    await addSpaceFromList(page, "형 방");
    await chooseTool(page, "연속선");
    const corner = [
      { x: 0, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 450 },
    ];
    await pressCm(page, FLOOR, corner, isMobile);
    await page.keyboard.press("Enter").catch(() => undefined);
    await finishEditing(page);
    await pill(page, "형 방").click();
    await page.screenshot({ path: testInfo.outputPath("space-thumbnail.png"), fullPage: true });
  });
});
