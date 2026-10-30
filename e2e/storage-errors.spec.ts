import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, setSavedData } from "./helpers";
import { addItem, listButton } from "./items";
import { mainTitle, pill } from "./spaces";
import { BROKEN_BACKUP_KEY, STORAGE_KEY } from "../src/shared/constants/storage";

const notice = (page: Page) => page.getByRole("status").filter({ hasText: /저장/ });
const BROKEN_MESSAGE = "저장된 데이터를 읽지 못해 샘플 공간으로 시작했어요";

/** 저장 값을 raw로 바꿔 두고 새로고침한다 (앱이 그 값으로 다시 연다). */
async function openWithSaved(page: Page, raw: string) {
  await page.goto("./");
  await setSavedData(page, raw);
  await page.reload();
  await expect(mainTitle(page)).toBeVisible();
}

const readKey = (page: Page, key: string) =>
  page.evaluate((name) => localStorage.getItem(name), key);

test.describe("깨진 데이터·옛 버전·저장 실패를 알리고 계속 쓰기", () => {
  test("깨진 값으로 열면 샘플 공간으로 시작하고 안내가 뜨며, 원래 값은 따로 남는다", async ({
    page,
  }, testInfo) => {
    await openWithSaved(page, "{여권");
    await expect(notice(page)).toContainText(BROKEN_MESSAGE);
    await expect(pill(page)).toBeVisible();
    expect(await readKey(page, BROKEN_BACKUP_KEY)).toBe("{여권");
    expect(await readKey(page, STORAGE_KEY)).toBe("{여권"); // 고치기 전에는 덮어쓰지 않는다
    await page.screenshot({ path: testInfo.outputPath("broken.png") });
    await page.getByRole("button", { name: "안내 닫기" }).click();
    await expect(notice(page)).toHaveCount(0);
  });

  test("엣지: 읽을 수 없는 버전(새 버전)도 같은 안내로 샘플 공간을 연다", async ({ page }) => {
    await openWithSaved(page, JSON.stringify({ version: 2, spaces: [], currentSpaceId: null }));
    await expect(notice(page)).toContainText(BROKEN_MESSAGE);
  });

  test("엣지: 깨진 값으로 시작해 고치면 새 데이터가 저장되고, 옮겨 둔 원래 값은 그대로다", async ({
    page,
  }) => {
    await openWithSaved(page, "[]");
    await page.getByRole("button", { name: "안내 닫기" }).click(); // 휴대폰은 안내가 목록 아래를 가린다
    await listButton(page, "보관함").click();
    await addItem(page, { name: "여름 옷" });
    expect(await readKey(page, STORAGE_KEY)).toContain("여름 옷");
    expect(await readKey(page, BROKEN_BACKUP_KEY)).toBe("[]");
    await page.reload();
    await expect(notice(page)).toHaveCount(0);
    await expect(listButton(page, "보관함")).toHaveAccessibleName("보관함 물건 2개");
  });

  test("저장에 실패하면(용량 초과) 안내가 뜨고, 앱은 계속 쓸 수 있다", async ({
    page,
    isMobile,
  }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException("저장 공간이 꽉 찼다", "QuotaExceededError");
      };
    });
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await expect(notice(page)).toContainText("저장하지 못했어요");
    await expect(page.getByRole("heading", { level: 1, name: "편집 모드" })).toBeVisible();
    if (!isMobile) await expect(page.getByRole("banner")).toContainText("저장하지 못했어요");
    expect(errors).toEqual([]); // 실패는 경고(console.warn)로만 남긴다
  });
});
