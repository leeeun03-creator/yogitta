import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { openEmptyScreen } from "./helpers";
import { mainTitle, openMain, pill, spaceList } from "./spaces";

/** 공간 바꾸기 목록을 열어 [백업 파일 내보내기]로 내려받고, 파일 이름과 내용을 돌려준다. */
async function exportBackup(page: Page) {
  await pill(page).click();
  const downloading = page.waitForEvent("download");
  await spaceList(page).getByRole("button", { name: "백업 파일 내보내기" }).click();
  const download = await downloading;
  const path = await download.path();
  return { name: download.suggestedFilename(), path, text: await readFile(path, "utf-8") };
}

test.describe("백업 파일 내보내기 / 가져오기", () => {
  test("공간 목록에서 백업 파일을 내보내면 날짜 이름의 JSON 파일에 공간이 들어 있다", async ({
    page,
  }) => {
    await openMain(page);
    const backup = await exportBackup(page);
    expect(backup.name).toMatch(/^yogitta-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(backup.text)).toMatchObject({ spaces: [{ name: "내 방" }] });
  });

  test("내보낸 파일을 다른 브라우저에서 가져오면 바꿀지 묻고, 바꾸면 같은 공간이 보인다", async ({
    page,
    browser,
    baseURL,
  }) => {
    await openMain(page); // 이 브라우저: 공간 "내 방" 하나
    const backup = await exportBackup(page);
    // 다른 브라우저(저장된 값 없음): 첫 접속이라 샘플 공간(내 방·형 방)이 보인다
    const storageState = { cookies: [], origins: [] };
    const other = await (await browser.newContext({ baseURL, storageState })).newPage();
    await other.goto("./");
    await expect(mainTitle(other)).toBeVisible();
    await pill(other).click();
    await spaceList(other).getByLabel("백업 파일 고르기").setInputFiles(backup.path);
    const ask = other.getByRole("alertdialog", { name: "백업 파일로 바꿀까요?" });
    await expect(ask).toHaveAccessibleDescription(
      "지금 공간 2개가 백업 파일의 공간 1개로 바뀌어요",
    );
    await ask.getByRole("button", { name: "바꾸기" }).click();
    if (!(await spaceList(other).isVisible())) await pill(other).click();
    await expect(spaceList(other).getByRole("button", { name: /형 방/ })).toHaveCount(0);
    await expect(
      spaceList(other).getByRole("button", { name: "내 방 이름 바꾸기·삭제" }),
    ).toBeVisible();
  });

  test("엣지: 깨진 파일은 안내만 띄우고 지금 데이터는 그대로다", async ({ page }) => {
    await openMain(page);
    await pill(page).click();
    await spaceList(page)
      .getByLabel("백업 파일 고르기")
      .setInputFiles({
        name: "broken.json",
        mimeType: "application/json",
        buffer: Buffer.from("{깨짐"),
      });
    await expect(spaceList(page).getByRole("status")).toHaveText(
      "백업 파일을 읽지 못했어요. 지금 데이터는 그대로예요",
    );
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath("backup-list.png") });
    await expect(
      spaceList(page).getByRole("button", { name: "내 방 이름 바꾸기·삭제" }),
    ).toBeVisible();
  });

  test("첫 실행 화면(공간 없음)에서도 백업 파일을 가져오면 메인 화면에 그 공간이 보인다", async ({
    page,
  }) => {
    await openMain(page);
    const backup = await exportBackup(page);
    await openEmptyScreen(page); // 공간을 모두 비운다
    await page.screenshot({ path: test.info().outputPath("empty.png") });
    await page.getByLabel("백업 파일 고르기").setInputFiles(backup.path);
    const ask = page.getByRole("alertdialog", { name: "백업 파일로 바꿀까요?" });
    await expect(ask).toHaveAccessibleDescription(
      "지금 공간 0개가 백업 파일의 공간 1개로 바뀌어요",
    );
    await ask.getByRole("button", { name: "바꾸기" }).click();
    await expect(mainTitle(page)).toBeVisible();
    await expect(pill(page)).toBeVisible();
  });
});
