import { describe, expect, it } from "vitest";
import type { Item } from "@/shared/types";
import { slotRows } from "./slotRows";

const item = (id: string, slot?: number): Item => ({
  id,
  name: id,
  ...(slot === undefined ? {} : { slot }),
});

describe("slotRows", () => {
  it("칸마다 칸 이름과 그 칸 물건(넣은 순서)을 위 칸부터 만든다", () => {
    const rows = slotRows({
      type: "drawer",
      rows: 3,
      cols: 1,
      items: [item("여권", 1), item("양말", 0), item("충전기", 1)],
    });
    expect(rows.map((row) => [row.label, row.items.map((each) => each.name)])).toEqual([
      ["1번째 서랍", ["양말"]],
      ["2번째 서랍", ["여권", "충전기"]],
      ["3번째 서랍", []],
    ]);
  });

  it("칸 없음에 물건이 있으면 맨 아래에 칸 없음 행을 붙이고, 없으면 붙이지 않는다", () => {
    const withLoose = slotRows({ type: "box", rows: 1, cols: 1, items: [item("선글라스")] });
    expect(withLoose.map((row) => row.label)).toEqual(["보관함 안", "칸 없음"]);
    expect(withLoose.at(-1)?.slot).toBeUndefined();
    expect(slotRows({ type: "box", rows: 1, cols: 1, items: [] }).map((row) => row.label)).toEqual([
      "보관함 안",
    ]);
  });

  it("엣지: 칸 수 밖 번호가 남은 물건도 칸 없음 행에 넣는다", () => {
    const rows = slotRows({ type: "shelf", rows: 2, cols: 1, items: [item("모자", 5)] });
    expect(rows.at(-1)).toMatchObject({ label: "칸 없음", items: [{ name: "모자" }] });
  });
});
