import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { findSegment } from "./findSegment";

const P = (x: number, y: number) => ({ x, y });
const RECT: Wall = {
  id: "rect",
  tool: "rect",
  points: [P(0, 0), P(300, 0), P(300, 200), P(0, 200)],
  closed: true,
};
const LINE: Wall = { id: "line", tool: "line", points: [P(100, 100), P(200, 100)], closed: false };

describe("findSegment", () => {
  it("반지름 안의 선분을 찾는다", () => {
    expect(findSegment([RECT], P(150, 5), 10)).toMatchObject({ lineId: "rect", segment: 0 });
  });

  it("닫힌 벽의 마지막 선분(마지막 → 첫 점)도 찾는다", () => {
    expect(findSegment([RECT], P(3, 100), 10)).toMatchObject({ lineId: "rect", segment: 3 });
  });

  it("여러 선분이 가까우면 가장 가까운 것을 고른다", () => {
    expect(findSegment([RECT, LINE], P(150, 98), 10)).toMatchObject({ lineId: "line", segment: 0 });
  });

  it("선분 끝 너머는 끝점까지 거리로 잰다", () => {
    expect(findSegment([LINE], P(208, 100), 10)).toMatchObject({ lineId: "line" });
    expect(findSegment([LINE], P(212, 100), 10)).toBeNull();
  });

  it("엣지: 반지름 밖이거나 벽이 없으면 null", () => {
    expect(findSegment([RECT], P(150, 100), 10)).toBeNull();
    expect(findSegment([], P(0, 0), 10)).toBeNull();
  });

  it("찾은 선분의 양 끝 점을 함께 돌려준다", () => {
    expect(findSegment([RECT], P(300, 100), 10)).toEqual({
      lineId: "rect",
      segment: 1,
      from: P(300, 0),
      to: P(300, 200),
    });
  });
});
