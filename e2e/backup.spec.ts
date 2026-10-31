import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { openMain, pill, spaceList } from "./spaces";

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
});
