import { describe, expect, it } from "vitest";
import { rowSum } from "./rowSum";

describe("rowSum", () => {
  it("합이 전체 높이와 같으면 합계와 전체 높이만 (균등 분배 소수 포함)", () => {
    expect(rowSum([30, 30, 30], 90)).toEqual({ text: "합계 90 / 전체 높이 90", isOver: false });
    expect(rowSum(Array<number>(7).fill(180 / 7), 180).text).toBe("합계 180 / 전체 높이 180");
  });

  it("합이 작으면 맨 아래 빈 자리를 알려 주고, 넘으면 isOver다", () => {
    expect(rowSum([20, 30, 30], 90)).toEqual({
      text: "합계 80 / 전체 높이 90 · 아래 10cm는 빈 자리예요",
      isOver: false,
    });
    expect(rowSum([30, 40, 30], 90)).toEqual({ text: "합계 100 / 전체 높이 90", isOver: true });
  });
});
