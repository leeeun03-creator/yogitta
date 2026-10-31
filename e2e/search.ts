import { expect, type Page } from "@playwright/test";
import { mainTitle } from "./spaces";

/** 메인 화면 검색창과 검색 카드를 찾는 실제 테스트 도우미. */
export const searchBox = (page: Page) => page.getByRole("searchbox", { name: "물건 검색" });
/** 찾았을 때 뜨는 검색 결과 카드 (제목 "요깃따!"). */
export const card = (page: Page) => page.getByRole("region", { name: "요깃따!" });
/** 못 찾았을 때 뜨는 결과 없음 카드. */
export const noResult = (page: Page) => page.getByRole("region", { name: "아직 어딨는지 몰라요" });

/** 저장 데이터 없이(첫 접속) 열어 샘플 공간 메인 화면을 띄운다. storageState를 비운 테스트에서 쓴다. */
export async function openSample(page: Page) {
  await page.goto("./");
  await expect(mainTitle(page)).toBeVisible();
}
