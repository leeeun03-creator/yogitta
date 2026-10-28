import type { Point } from "@/shared/types";

/** 두 점 사이 직선 거리 (같은 단위: cm끼리, px끼리). */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
