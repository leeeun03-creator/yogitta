import { describe, expect, it } from "vitest";
import { rowSpans } from "./rowSpans";

describe("rowSpans", () => {
  it("칸 높이가 없으면 가구 높이를 칸 수로 균등 분배하고 위 칸부터 돌려준다", () => {
    expect(rowSpans({ h: 90, rows: 3 })).toEqual([
      { bottom: 60, height: 30 },
      { bottom: 30, height: 30 },
      { bottom: 0, height: 30 },
    ]);
  });

  it("정해 둔 칸 높이(위 칸부터)를 그대로 쓴다", () => {
    expect(rowSpans({ h: 100, rows: 3, rowHeights: [50, 30, 20] })).toEqual([
      { bottom: 50, height: 50 },
      { bottom: 20, height: 30 },
      { bottom: 0, height: 20 },
    ]);
  });

  it("엣지: 칸 높이 개수·합이 맞지 않거나 0 이하가 있으면 균등 분배한다", () => {
    const even = rowSpans({ h: 100, rows: 2 });
    expect(rowSpans({ h: 100, rows: 2, rowHeights: [50, 30, 20] })).toEqual(even);
    expect(rowSpans({ h: 100, rows: 2, rowHeights: [70, 40] })).toEqual(even);
    expect(rowSpans({ h: 100, rows: 2, rowHeights: [100, 0] })).toEqual(even);
  });

  it("엣지: 칸 1개면 가구 전체, 칸 수가 0 이하로 잘못 들어와도 1칸으로 본다", () => {
    expect(rowSpans({ h: 40, rows: 1 })).toEqual([{ bottom: 0, height: 40 }]);
    expect(rowSpans({ h: 40, rows: 0 })).toEqual([{ bottom: 0, height: 40 }]);
  });
});
