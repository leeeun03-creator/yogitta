import { describe, expect, it } from "vitest";
import { closestPointOnSegment } from "./closestPointOnSegment";

const A = { x: 0, y: 0 };
const B = { x: 100, y: 0 };

describe("closestPointOnSegment", () => {
  it("선분 옆 점은 수직으로 내린 자리다", () => {
    expect(closestPointOnSegment({ x: 40, y: 25 }, A, B)).toEqual({ x: 40, y: 0 });
  });

  it("엣지: 선분 끝 너머 점은 가까운 끝점이다", () => {
    expect(closestPointOnSegment({ x: -30, y: 10 }, A, B)).toEqual(A);
    expect(closestPointOnSegment({ x: 130, y: -10 }, A, B)).toEqual(B);
  });

  it("엣지: 길이 0 선분은 그 점이다", () => {
    expect(closestPointOnSegment({ x: 5, y: 5 }, A, A)).toEqual(A);
  });

  it("대각선 선분에서도 맞는다", () => {
    expect(closestPointOnSegment({ x: 0, y: 100 }, A, { x: 100, y: 100 })).toEqual({
      x: 50,
      y: 50,
    });
  });
});
