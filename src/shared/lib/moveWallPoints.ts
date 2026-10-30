import type { Point, Wall } from "@/shared/types";

const isSame = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

/**
 * from 자리에 있는 벽 점을 모두 to로 옮긴 벽 목록. 끝점끼리 붙은 벽은 같은 자리 점을 나눠 가지므로
 * 같이 옮겨져 이어진 채로 남는다. 그 점이 없는 벽은 원본 그대로 둔다.
 */
export function moveWallPoints(walls: readonly Wall[], from: Point, to: Point): Wall[] {
  return walls.map((wall) =>
    wall.points.some((point) => isSame(point, from))
      ? { ...wall, points: wall.points.map((point) => (isSame(point, from) ? { ...to } : point)) }
      : wall,
  );
}
