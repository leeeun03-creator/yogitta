import { describe, expect, it } from "vitest";
import { FLOOR_GRID_LIFT_CM } from "@/shared/constants/scene";
import { floorGridPoints } from "./floorGridPoints";

/** 끝점 6개(x, y, z × 2)씩 묶어 선분 목록으로 바꾼다. */
const segments = (points: number[]) =>
  Array.from({ length: points.length / 6 }, (_, i) => points.slice(i * 6, i * 6 + 6));

describe("floorGridPoints", () => {
  it("2D 평면도와 같은 50cm 자리에 선을 긋고, 2D y는 3D z가 된다", () => {
    const lines = segments(floorGridPoints({ w: 150, h: 100 }));
    const y = FLOOR_GRID_LIFT_CM;
    expect(lines).toEqual([
      [50, y, 0, 50, y, 100],
      [100, y, 0, 100, y, 100],
      [0, y, 50, 150, y, 50],
    ]);
  });

  it("격자선은 바닥 면보다 살짝 위에 있다", () => {
    const points = floorGridPoints({ w: 600, h: 450 });
    const heights = points.filter((_, i) => i % 3 === 1);
    expect(heights.every((height) => height > 0)).toBe(true);
  });

  it("엣지: 50cm보다 작은 바닥은 안쪽 선이 없다", () => {
    expect(floorGridPoints({ w: 50, h: 40 })).toEqual([]);
  });
});
