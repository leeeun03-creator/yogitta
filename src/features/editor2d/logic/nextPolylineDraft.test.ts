import { describe, expect, it } from "vitest";
import { finishPolyline, nextPolylineDraft } from "./nextPolylineDraft";

const P = (x: number, y: number) => ({ x, y });
const RADIUS = 10;
const THREE = [P(0, 0), P(300, 0), P(300, 200)];

describe("nextPolylineDraft", () => {
  it("첫 점으로 시작하고 누를 때마다 점이 이어진다", () => {
    expect(nextPolylineDraft([], P(0, 0), RADIUS)).toEqual({ draft: [P(0, 0)] });
    expect(nextPolylineDraft([P(0, 0)], P(300, 0), RADIUS)).toEqual({
      draft: [P(0, 0), P(300, 0)],
    });
  });

  it("마지막 점을 다시 누르면 열린 벽으로 끝난다", () => {
    expect(nextPolylineDraft(THREE, P(300, 200), RADIUS)).toEqual({
      draft: [],
      wall: { points: THREE, closed: false },
    });
  });

  it("점이 3개 이상일 때 첫 점 근처를 누르면 닫힌 벽이 된다", () => {
    expect(nextPolylineDraft(THREE, P(4, 6), RADIUS)).toEqual({
      draft: [],
      wall: { points: THREE, closed: true },
    });
  });

  it("엣지: 점이 1개일 때 같은 자리를 누르면 무시한다 (점을 늘리지 않음)", () => {
    expect(nextPolylineDraft([P(0, 0)], P(0, 0), RADIUS)).toEqual({ draft: [P(0, 0)] });
  });

  it("엣지: 점이 2개일 때 첫 점을 누르면 닫지 않고 무시한다", () => {
    expect(nextPolylineDraft([P(0, 0), P(300, 0)], P(0, 0), RADIUS)).toEqual({
      draft: [P(0, 0), P(300, 0)],
    });
  });

  it("첫 점에서 반지름보다 멀면 닫지 않고 이어 붙인다", () => {
    expect(nextPolylineDraft(THREE, P(11, 0), RADIUS).draft).toHaveLength(4);
  });

  it("원본 draft를 바꾸지 않는다", () => {
    const draft = Object.freeze([...THREE]);
    nextPolylineDraft(draft, P(100, 100), RADIUS);
    expect(draft).toHaveLength(3);
  });
});

describe("finishPolyline", () => {
  it("점이 2개 이상이면 열린 벽으로 끝낸다", () => {
    expect(finishPolyline([P(0, 0), P(100, 0)])).toEqual({
      draft: [],
      wall: { points: [P(0, 0), P(100, 0)], closed: false },
    });
  });

  it("엣지: 점이 0~1개면 벽을 만들지 않는다", () => {
    expect(finishPolyline([])).toEqual({ draft: [] });
    expect(finishPolyline([P(0, 0)])).toEqual({ draft: [P(0, 0)] });
  });
});
