import { describe, expect, it } from "vitest";
import { defaultBoxAt } from "./defaultBoxAt";

describe("defaultBoxAt", () => {
  it("누른 자리가 가운데인 60 × 50 cm 가구다", () => {
    expect(defaultBoxAt({ x: 213, y: 148 }, null)).toEqual({
      center: { x: 213, y: 148 },
      w: 60,
      d: 50,
    });
  });

  it("격자 스냅이 켜져 있으면 가장자리가 10cm 격자선에 온다", () => {
    const { center, w, d } = defaultBoxAt({ x: 213, y: 148 }, 10);
    expect(center).toEqual({ x: 210, y: 145 });
    expect([center.x - w / 2, center.y - d / 2]).toEqual([180, 120]);
  });

  it("엣지: 격자 위를 누르면 그 자리 근처에서 가장자리만 격자에 맞춘다", () => {
    expect(defaultBoxAt({ x: 300, y: 200 }, 10).center).toEqual({ x: 300, y: 205 });
  });
});
