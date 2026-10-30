import { describe, expect, it } from "vitest";
import type { Point } from "@/shared/types";
import { convexOverlap } from "./convexOverlap";

/** 왼쪽 위 (x, y)에서 가로 w, 세로 h인 사각형 꼭짓점. */
const rect = (x: number, y: number, w: number, h: number): Point[] => [
  { x, y },
  { x: x + w, y },
  { x: x + w, y: y + h },
  { x, y: y + h },
];

describe("convexOverlap", () => {
  it("파고들면 겹친다", () => {
    expect(convexOverlap(rect(0, 0, 100, 50), rect(90, 10, 100, 50))).toBe(true);
  });

  it("떨어져 있으면 겹치지 않는다", () => {
    expect(convexOverlap(rect(0, 0, 100, 50), rect(120, 0, 100, 50))).toBe(false);
  });

  it("엣지: 면이 맞닿거나 꼭짓점만 닿으면 겹침이 아니다", () => {
    expect(convexOverlap(rect(0, 0, 100, 50), rect(100, 0, 100, 50))).toBe(false);
    expect(convexOverlap(rect(0, 0, 100, 50), rect(100, 50, 100, 50))).toBe(false);
  });

  it("엣지: 0.01cm까지 파고든 것은 맞닿은 것(소수 오차), 그보다 깊으면 겹침", () => {
    expect(convexOverlap(rect(0, 0, 100, 50), rect(99.995, 0, 100, 50))).toBe(false);
    expect(convexOverlap(rect(0, 0, 100, 50), rect(99.9, 0, 100, 50))).toBe(true);
  });

  it("엣지: 비스듬한 사각형은 꼭짓점 사이 빈틈이면 겹치지 않는다", () => {
    // 45도 마름모: 가운데 (150, 25), 반지름 30 → 왼쪽 꼭짓점 (120, 25)
    const diamond = [
      { x: 150, y: -5 },
      { x: 180, y: 25 },
      { x: 150, y: 55 },
      { x: 120, y: 25 },
    ];
    expect(convexOverlap(rect(0, 0, 100, 50), diamond)).toBe(false);
    expect(convexOverlap(rect(0, 0, 125, 50), diamond)).toBe(true);
    // 사각형 모서리(100, 50) 바깥으로 비스듬히 지나는 경우: 축으로만 보면 겹쳐 보이지만 떨어져 있다
    const nearCorner = [
      { x: 110, y: 50 },
      { x: 130, y: 70 },
      { x: 110, y: 90 },
      { x: 90, y: 70 },
    ];
    expect(convexOverlap(rect(0, 0, 100, 50), nearCorner)).toBe(false);
  });

  it("엣지: 한쪽이 다른 쪽 안에 통째로 들어 있어도 겹친다", () => {
    expect(convexOverlap(rect(0, 0, 100, 100), rect(40, 40, 10, 10))).toBe(true);
  });
});
