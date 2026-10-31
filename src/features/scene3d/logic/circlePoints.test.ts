import { describe, expect, it } from "vitest";
import { circlePoints } from "./circlePoints";

describe("circlePoints", () => {
  it("반지름만큼 떨어진 점들이고, 처음 점으로 닫힌다", () => {
    const points = circlePoints(50, 0.5, 4);
    expect(points).toHaveLength(5);
    for (const [x, y, z] of points) {
      expect(Math.hypot(x, z)).toBeCloseTo(50);
      expect(y).toBe(0.5);
    }
    expect(points[4]?.[0]).toBeCloseTo(points[0]?.[0] ?? 0);
    expect(points[4]?.[2]).toBeCloseTo(points[0]?.[2] ?? 0);
  });
});
