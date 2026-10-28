import { describe, expect, it } from "vitest";
import { labelPosition } from "./labelPosition";

const P = (x: number, y: number) => ({ x, y });
const BOX = { x: -50, y: -50, width: 700, height: 550, cmPerPx: 1 };
const HALF = { x: 30, y: 10 }; // 글자 상자 절반
const GAP = 10;

describe("labelPosition", () => {
  it("가로선은 가운데 위쪽으로 글자 높이 절반 + GAP만큼 띄운다", () => {
    expect(labelPosition(P(100, 200), P(400, 200), GAP, HALF, BOX)).toEqual(P(250, 180));
  });

  it("거꾸로 그린 가로선도 위쪽이다", () => {
    expect(labelPosition(P(400, 200), P(100, 200), GAP, HALF, BOX)).toEqual(P(250, 180));
  });

  it("세로선은 위아래 어느 방향이든 왼쪽으로 띄운다", () => {
    // 세로선은 글자 폭 절반(30)만큼 더 띄운다
    expect(labelPosition(P(300, 100), P(300, 400), GAP, HALF, BOX)).toEqual(P(260, 250));
    expect(labelPosition(P(300, 400), P(300, 100), GAP, HALF, BOX)).toEqual(P(260, 250));
  });

  it("대각선은 선과 직각으로, 글자 상자가 선에서 GAP만큼 떨어지게 둔다", () => {
    const a = P(0, 0);
    const b = P(300, 400);
    const at = labelPosition(a, b, GAP, HALF, BOX);
    // normal (0.8, -0.6) 방향 글자 상자 절반 = 0.8 × 30 + 0.6 × 10 = 30
    expect(Math.hypot(at.x - 150, at.y - 200)).toBeCloseTo(GAP + 30);
    // 선 방향과 직각 (내적 0)
    expect((at.x - 150) * 300 + (at.y - 200) * 400).toBeCloseTo(0);
    expect(at.y).toBeLessThan(200);
  });

  it("엣지: 위쪽이 화면 밖이면 아래쪽에 둔다", () => {
    expect(labelPosition(P(100, -40), P(400, -40), GAP, HALF, BOX)).toEqual(P(250, -20));
  });

  it("엣지: 화면 왼쪽 가장자리의 세로선은 오른쪽에 둔다", () => {
    expect(labelPosition(P(-49, 100), P(-49, 300), GAP, HALF, BOX)).toEqual(P(-9, 200));
  });

  it("엣지: 양쪽 다 밖이면 화면 안으로 당긴다", () => {
    const short = { x: 0, y: 0, width: 100, height: 30, cmPerPx: 1 };
    expect(labelPosition(P(20, 15), P(80, 15), GAP, HALF, short)).toEqual(P(50, 10));
  });

  it("엣지: 길이 0이면 그 점 자리 (사각형 가운데), 화면 밖이면 안으로 당긴다", () => {
    expect(labelPosition(P(10, 10), P(10, 10), GAP, HALF, BOX)).toEqual(P(10, 10));
    expect(labelPosition(P(700, 10), P(700, 10), GAP, HALF, BOX)).toEqual(P(620, 10));
  });
});
