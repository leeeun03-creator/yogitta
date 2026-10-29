import { LINE_MIN_POINTS } from "@/shared/constants/units";
import { lineSegments } from "@/shared/lib/lineSegments";
import type { Point, Wall } from "@/shared/types";

/** 점 목록 조각을 벽으로 만든다. 점 2개면 직선, 더 많으면 연속선. */
function toWall(id: string, points: Point[]): Wall {
  return {
    id,
    tool: points.length === LINE_MIN_POINTS ? "line" : "polyline",
    points,
    closed: false,
  };
}

/**
 * 벽에서 i번 선분(i번 점 → i+1번 점, 닫힌 벽은 마지막 → 첫 점까지)을 지우고 남은 벽들을 돌려준다.
 * 열린 벽 가운데를 지우면 둘로 나뉘고(뒤쪽은 newId), 닫힌 벽은 지운 자리가 끝인 열린 벽이 된다.
 */
export function removeSegment(wall: Wall, index: number, newId: string): Wall[] {
  const { points } = wall;
  const segmentCount = lineSegments(wall).length;
  if (!Number.isInteger(index) || index < 0 || index >= segmentCount) return [wall];

  if (wall.closed) {
    const rotated = [...points.slice(index + 1), ...points.slice(0, index + 1)];
    return [toWall(wall.id, rotated)];
  }

  const before = points.slice(0, index + 1);
  const after = points.slice(index + 1);
  const pieces: Wall[] = [];
  if (before.length >= LINE_MIN_POINTS) pieces.push(toWall(wall.id, before));
  if (after.length >= LINE_MIN_POINTS) pieces.push(toWall(pieces.length ? newId : wall.id, after));
  return pieces;
}
