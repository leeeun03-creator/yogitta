import type { Point } from "@/shared/types";

type Line = { points: readonly Point[]; closed?: boolean };

/** 선(벽·구역 선)을 이루는 선분 [앞 점, 뒤 점] 목록. 닫힌 선은 마지막 점 → 첫 점 선분도 넣는다. */
export function lineSegments({ points, closed }: Line): [Point, Point][] {
  const count = closed ? points.length : points.length - 1;
  const segments: [Point, Point][] = [];
  for (let index = 0; index < count; index++) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    if (a && b) segments.push([a, b]);
  }
  return segments;
}
