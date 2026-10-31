import { describe, expect, it } from "vitest";
import { createBoxTestData } from "./boxFixtures";
import { changeRowHeight } from "./changeRowHeight";
import { deepFreeze } from "./spaceFixtures";

// 서랍장 3칸, 높이 90 (균등 분배하면 30 · 30 · 30)
const drawer = () => createBoxTestData([{ type: "drawer", rows: 3, h: 90 }]);
const heightsOf = (result: ReturnType<typeof changeRowHeight>) =>
  result.ok ? result.data.spaces[0]?.boxes[0]?.rowHeights : result.reason;

describe("changeRowHeight", () => {
  it("균등 분배에서 시작해 그 칸만 바꾼다 (합이 작으면 아래가 빈다)", () => {
    expect(heightsOf(changeRowHeight(drawer(), "box_1", 0, 25))).toEqual([25, 30, 30]);
  });

  it("정해 둔 칸 높이에서 이어서 바꿔 합을 전체 높이에 맞출 수 있다", () => {
    const first = changeRowHeight(drawer(), "box_1", 0, 25);
    const data = first.ok ? first.data : drawer();
    expect(heightsOf(changeRowHeight(data, "box_1", 2, 35))).toEqual([25, 30, 35]);
  });

  it("엣지: 합이 전체 높이를 넘으면 막는다", () => {
    expect(heightsOf(changeRowHeight(drawer(), "box_1", 1, 31))).toBe("overHeight");
  });

  it("엣지: 최소(10cm)보다 작으면(0·음수 포함) 막는다", () => {
    expect(heightsOf(changeRowHeight(drawer(), "box_1", 1, 9))).toBe("tooSmall");
    expect(heightsOf(changeRowHeight(drawer(), "box_1", 1, 0))).toBe("tooSmall");
    expect(heightsOf(changeRowHeight(drawer(), "box_1", 1, -5))).toBe("tooSmall");
    expect(heightsOf(changeRowHeight(drawer(), "box_1", 1, 10))).toEqual([30, 10, 30]);
  });

  it("엣지: 높이가 같거나 없는 가구·칸이면 원본 그대로다 (되돌리기 기록이 늘지 않게)", () => {
    const original = deepFreeze(drawer());
    for (const [id, row, height] of [
      ["box_1", 0, 30],
      ["box_9", 0, 20],
      ["box_1", 3, 20],
    ] as const) {
      const result = changeRowHeight(original, id, row, height);
      expect(result.ok && result.data).toBe(original);
    }
  });
});
