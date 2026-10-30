import { distance } from "@/shared/lib/distance";
import type { Point, Wall } from "@/shared/types";

/** at(cm)에서 radius(cm) 안에 있는 가장 가까운 벽 점. 없으면 null. */
export function findWallPointAt(walls: readonly Wall[], at: Point, radius: number): Point | null {
  let best: Point | null = null;
  let bestDistance = radius;
  for (const point of walls.flatMap((wall) => wall.points)) {
    const gap = distance(point, at);
    if (gap <= bestDistance) {
      best = point;
      bestDistance = gap;
    }
  }
  return best;
}
