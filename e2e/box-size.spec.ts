import { expect, test, type Page } from "@playwright/test";
import { collectErrors, createSpace, pressCm } from "./helpers";
import {
  FLOOR,
  drawWall,
  expectBox,
  openDetails,
  panel,
  placeBox,
  sizeField,
  typeButton,
} from "./boxes";

const undo = (page: Page) => page.getByRole("button", { name: "되돌리기" }).click();
const stepper = (page: Page) => panel(page).getByRole("group", { name: "칸 수" });

/** 크기 입력칸에 써 넣고 Enter. */
async function setSize(page: Page, label: "가로" | "깊이" | "높이", value: string) {
  await sizeField(page, label).fill(value);
  await sizeField(page, label).press("Enter");
}

test.describe("속성 패널에서 가구 크기·칸 수 바꾸기", () => {
  test.skip(
    ({ isMobile, browserName }) => isMobile && browserName !== "chromium",
    "모바일 끌기는 크롬 CDP로",
  );

  test.beforeEach(async ({ page, isMobile }) => {
    await createSpace(page, { width: "6.0", depth: "4.5" });
    await placeBox(page, { x: 100, y: 50 }, { x: 300, y: 200 }, isMobile); // 200 × 150, 가운데 (200, 125)
    await openDetails(page); // 휴대폰은 크기가 접혀 있다
  });

  test("가로를 키우면 가운데는 그대로 넓어지고, 높이도 바뀌며, 되돌리기 한 번에 하나씩 돌아온다", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await setSize(page, "가로", "300");
    await expectBox(page, [200, 125, 300, 150, 0]);
    await setSize(page, "높이", "180");
    await expect(sizeField(page, "높이")).toHaveValue("180");
    await undo(page);
    await expect(sizeField(page, "높이")).toHaveValue("90");
    await undo(page);
    await expectBox(page, [200, 125, 200, 150, 0]);
    expect(errors).toEqual([]);
  });

  test("엣지: 9cm·글자·빈 값·241cm·바닥보다 긴 값은 바뀌지 않고 까닭이 뜨며, Esc면 지금 크기로", async ({
    page,
  }) => {
    const cases: [label: "가로" | "깊이" | "높이", value: string, message: string][] = [
      ["가로", "9", "10cm보다 작게 할 수 없어요"],
      ["깊이", "abc", "크기는 숫자로 써 주세요"],
      ["깊이", " ", "크기는 숫자로 써 주세요"],
      ["높이", "241", "높이는 240cm까지예요"],
      ["가로", "601", "바닥보다 길어서 이 크기로 바꿀 수 없어요"],
    ];
    for (const [label, value, message] of cases) {
      await setSize(page, label, value);
      await expect(sizeField(page, label), value).toHaveAccessibleDescription(message);
      await sizeField(page, label).press("Escape");
      await expect(sizeField(page, label)).not.toHaveAttribute("aria-invalid", "true");
    }
    await expectBox(page, [200, 125, 200, 150, 0]);
  });

  test("엣지: 소수는 반올림하고, 입력칸을 벗어나도 바뀌며, 바닥 가장자리에서 키우면 바닥 안으로 당긴다", async ({
    page,
  }) => {
    await sizeField(page, "깊이").fill("120.4");
    await sizeField(page, "깊이").blur();
    await expect(sizeField(page, "깊이")).toHaveValue("120");
    await setSize(page, "가로", "600"); // 가운데 200이면 왼쪽이 바닥 밖이라 가운데 300으로 당긴다
    await expectBox(page, [300, 125, 600, 120, 0]);
  });

  test("엣지: 키워서 벽에 파고들면 바뀌지 않고 까닭이 뜬다", async ({ page, isMobile }) => {
    await drawWall(page, { x: 350, y: 0 }, { x: 350, y: 450 }, isMobile); // 벽 면 x 344
    await pressCm(page, FLOOR, [{ x: 200, y: 125 }], isMobile); // 다시 고른다
    await openDetails(page);
    await setSize(page, "가로", "300"); // x 50 ~ 350: 벽에 파고든다
    await expect(sizeField(page, "가로")).toHaveAccessibleDescription(
      "벽이나 다른 가구와 겹쳐서 이 크기로 바꿀 수 없어요",
    );
    await expectBox(page, [200, 125, 200, 150, 0]);
  });

  test("칸 수: 서랍장은 − 3칸 +로 1 ~ 8칸, 끝에서는 막히고, 보관함은 칸 수가 없다", async ({
    page,
  }, testInfo) => {
    await expect(stepper(page)).toHaveCount(0); // 보관함
    await typeButton(page, "서랍장").click();
    const count = stepper(page).getByRole("status");
    await expect(count).toHaveText("3칸");
    await stepper(page).getByRole("button", { name: "칸 늘리기" }).click();
    await expect(count).toHaveText("4칸");
    await undo(page);
    await expect(count).toHaveText("3칸");
    const fewer = stepper(page).getByRole("button", { name: "칸 줄이기" });
    await fewer.click();
    await fewer.click();
    await expect(count).toHaveText("1칸");
    await expect(fewer).toBeDisabled();
    const more = stepper(page).getByRole("button", { name: "칸 늘리기" });
    for (let step = 0; step < 7; step++) await more.click();
    await expect(count).toHaveText("8칸");
    await expect(more).toBeDisabled();
    await page.screenshot({ path: testInfo.outputPath("box-size.png"), fullPage: true });
  });
});
