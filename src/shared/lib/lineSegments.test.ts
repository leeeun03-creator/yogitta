import { describe, expect, it } from "vitest";
import { lineSegments } from "./lineSegments";

const a = { x: 0, y: 0 };
const b = { x: 100, y: 0 };
const c = { x: 100, y: 100 };

describe("lineSegments", () => {
  it("열린 선은 점 n개에 선분 n - 1개다", () => {
    expect(lineSegments({ points: [a, b, c] })).toEqual([
      [a, b],
      [b, c],
    ]);
  });

  it("닫힌 선은 마지막 점 → 첫 점 선분도 넣는다", () => {
    expect(lineSegments({ points: [a, b, c], closed: true })).toEqual([
      [a, b],
      [b, c],
      [c, a],
    ]);
  });

  it("엣지: 점이 0개·1개인 열린 선은 선분이 없다", () => {
    expect(lineSegments({ points: [] })).toEqual([]);
    expect(lineSegments({ points: [a] })).toEqual([]);
    expect(lineSegments({ points: [], closed: true })).toEqual([]);
  });
});
