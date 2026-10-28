import { describe, expect, it } from "vitest";
import { snapPoint, type SnapOptions } from "./snapPoint";

const P = (x: number, y: number) => ({ x, y });
const ON: SnapOptions = {
  enabled: true,
  endpointRadius: 15,
  gridStep: 10,
  floor: { w: 600, h: 455 },
};
const OFF: SnapOptions = { ...ON, enabled: false };

describe("snapPoint", () => {
  it("반지름 안의 벽 점에 정확히 붙는다 (틈 0)", () => {
    expect(snapPoint(P(107.3, 93.8), [P(101, 99)], ON)).toEqual({
      point: P(101, 99),
      kind: "endpoint",
    });
  });

  it("여러 점이 반지름 안이면 가장 가까운 점", () => {
    expect(snapPoint(P(100, 100), [P(112, 100), P(100, 105), P(90, 90)], ON).point).toEqual(
      P(100, 105),
    );
  });

  it("붙을 점이 없으면 10cm 격자로 반올림한다", () => {
    expect(snapPoint(P(123, 87.4), [], ON)).toEqual({ point: P(120, 90), kind: "grid" });
    expect(snapPoint(P(125, 85), [], ON).point).toEqual(P(130, 90)); // 반올림
  });

  it("엣지: 반지름 경계 — 바로 안은 붙고 바로 밖은 격자", () => {
    expect(snapPoint(P(115, 100), [P(100, 100)], ON).kind).toBe("endpoint");
    expect(snapPoint(P(115.1, 100), [P(100, 100)], ON)).toEqual({
      point: P(120, 100),
      kind: "grid",
    });
  });

  it("엣지: 바닥 가장자리의 점에도 붙는다", () => {
    expect(snapPoint(P(596, 452), [P(600, 455)], ON).point).toEqual(P(600, 455));
  });

  it("엣지: 격자 반올림이 바닥 밖으로 나가지 않는다 (455cm 바닥에서 460 → 455)", () => {
    expect(snapPoint(P(300, 458), [], ON).point).toEqual(P(300, 455)); // 460으로 올라가면 바닥 끝 455
    expect(snapPoint(P(-30, 999), [], ON).point).toEqual(P(0, 455));
  });

  it("스냅을 끄면 벽 점 근처여도 1cm 반올림만 한다", () => {
    expect(snapPoint(P(103.6, 99.2), [P(100, 100)], OFF)).toEqual({
      point: P(104, 99),
      kind: "none",
    });
  });

  it("붙인 결과는 원래 점 객체와 다른 새 객체다 (원본 벽 점을 바꾸지 않게)", () => {
    const target = P(100, 100);
    expect(snapPoint(P(101, 101), [target], ON).point).not.toBe(target);
  });
});
