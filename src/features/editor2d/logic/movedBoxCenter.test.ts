import { describe, expect, it } from "vitest";
import { movedBoxCenter } from "./movedBoxCenter";

const BASE = {
  origin: { x: 200, y: 125 },
  size: { w: 200, d: 150 },
  floor: { w: 600, h: 450 },
};

describe("movedBoxCenter", () => {
  it("격자 스냅을 끄면 끈 만큼 그대로 옮긴다", () => {
    expect(movedBoxCenter({ ...BASE, delta: { x: 33, y: 17 }, gridStep: null })).toEqual({
      x: 233,
      y: 142,
    });
  });

  it("격자 스냅이 켜져 있으면 가장자리가 10cm 격자선에 온다", () => {
    // 왼쪽 위 모서리 (100, 50) + (33, 17) = (133, 67) → (130, 70)
    expect(movedBoxCenter({ ...BASE, delta: { x: 33, y: 17 }, gridStep: 10 })).toEqual({
      x: 230,
      y: 145,
    });
  });

  it("엣지: 바닥 밖으로 끌면 가장자리가 바닥 경계에 닿는 자리에서 멈춘다", () => {
    expect(movedBoxCenter({ ...BASE, delta: { x: 900, y: -400 }, gridStep: 10 })).toEqual({
      x: 500,
      y: 75,
    });
  });

  it("엣지: 격자에 안 맞는 크기(45cm)도 왼쪽 위 모서리를 격자에 붙인다", () => {
    const center = movedBoxCenter({
      ...BASE,
      size: { w: 45, d: 45 },
      delta: { x: 4, y: 0 },
      gridStep: 10,
    });
    expect(center.x - 45 / 2).toBe(180);
  });
});
