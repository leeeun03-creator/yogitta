import { describe, expect, it } from "vitest";
import { rowHeightsOf } from "./rowHeightsOf";

describe("rowHeightsOf", () => {
  it("칸 높이가 없으면 가구 높이를 칸 수로 균등 분배한다", () => {
    expect(rowHeightsOf({ h: 90, rows: 3 })).toEqual([30, 30, 30]);
    expect(rowHeightsOf({ h: 90, rows: 4 })).toEqual([22.5, 22.5, 22.5, 22.5]);
  });

  it("정해 둔 칸 높이는 합이 가구 높이와 같거나 작으면 그대로 쓴다 (작으면 아래가 빈다)", () => {
    expect(rowHeightsOf({ h: 90, rows: 3, rowHeights: [25, 30, 35] })).toEqual([25, 30, 35]);
    expect(rowHeightsOf({ h: 90, rows: 3, rowHeights: [20, 30, 30] })).toEqual([20, 30, 30]);
  });

  it("엣지: 개수가 다르거나, 0 이하가 있거나, 합이 가구 높이를 넘으면 균등 분배한다", () => {
    const even = [50, 50];
    expect(rowHeightsOf({ h: 100, rows: 2, rowHeights: [50, 30, 20] })).toEqual(even);
    expect(rowHeightsOf({ h: 100, rows: 2, rowHeights: [100, 0] })).toEqual(even);
    expect(rowHeightsOf({ h: 100, rows: 2, rowHeights: [70, 40] })).toEqual(even);
    expect(rowHeightsOf({ h: 100, rows: 2, rowHeights: [60, 40.3] })).toEqual([60, 40.3]); // 반올림 오차 안
  });
});
