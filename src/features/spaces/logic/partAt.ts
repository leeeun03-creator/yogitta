import { ROOM_GRID_CM } from "@/shared/constants/room";
import type { Point } from "@/shared/types";
import { BLOCKED, type FloorParts } from "./splitFloor";

/** 점이 든 구획 번호. 바닥 밖이거나 벽·구역 선 위 격자면 null이다. */
export function partAt(parts: FloorParts, point: Point): number | null {
  const col = Math.floor(point.x / ROOM_GRID_CM);
  const row = Math.floor(point.y / ROOM_GRID_CM);
  if (col < 0 || row < 0 || col >= parts.cols || row >= parts.rows) return null;
  const id = parts.part[row * parts.cols + col] ?? BLOCKED;
  return id === BLOCKED ? null : id;
}
