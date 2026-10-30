import { TOUCH_TOLERANCE_CM } from "@/shared/constants/furniture";
import type { Point } from "@/shared/types";

/** 다각형 꼭짓점들을 축(axis) 위에 비춘 범위. */
function project(polygon: readonly Point[], axis: Point) {
  let min = Infinity;
  let max = -Infinity;
  for (const point of polygon) {
    const value = point.x * axis.x + point.y * axis.y;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return { min, max };
}

/** 다각형 변마다 수직인 축 (길이 1). */
function edgeNormals(polygon: readonly Point[]): Point[] {
  return polygon.flatMap((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    if (!next) return [];
    const length = Math.hypot(next.x - point.x, next.y - point.y);
    if (length === 0) return [];
    return [{ x: -(next.y - point.y) / length, y: (next.x - point.x) / length }];
  });
}

/**
 * 볼록 다각형 두 개(cm)가 서로 파고드는지 (분리축 검사). 어느 한 축에서라도 겹친 깊이가
 * TOUCH_TOLERANCE_CM 이하면 떨어진 것으로 본다. 그래서 면이 맞닿거나 꼭짓점만 닿은 것은 겹침이 아니다.
 */
export function convexOverlap(a: readonly Point[], b: readonly Point[]): boolean {
  for (const axis of [...edgeNormals(a), ...edgeNormals(b)]) {
    const first = project(a, axis);
    const second = project(b, axis);
    const depth = Math.min(first.max, second.max) - Math.max(first.min, second.min);
    if (depth <= TOUCH_TOLERANCE_CM) return false;
  }
  return true;
}
