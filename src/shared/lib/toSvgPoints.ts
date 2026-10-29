import type { Point } from "@/shared/types";

/** 점 목록(cm)을 SVG polyline·polygon의 points 글자("x,y x,y …")로. */
export function toSvgPoints(points: readonly Point[]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}
