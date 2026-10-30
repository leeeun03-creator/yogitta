import { isWallBlocked } from "@/shared/lib/isWallBlocked";
import { lineSegments } from "@/shared/lib/lineSegments";
import { moveWallPoints } from "@/shared/lib/moveWallPoints";
import type { AppData, Point, Wall } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 벽 점을 못 옮기는 까닭: 선분 길이가 0이 됨(옆 점 위로 겹침), 가구를 지나가게 됨. */
export type WallMoveBlock = "zeroLength" | "blocked";
export type WallMoveResult = { ok: true; data: AppData } | { ok: false; reason: WallMoveBlock };

const hasZeroSegment = (wall: Wall) =>
  lineSegments(wall).some(([a, b]) => a.x === b.x && a.y === b.y);

/**
 * 현재 공간에서 from 자리의 벽 점(붙어 있는 다른 벽의 점 포함)을 to로 옮긴다.
 * 선분 길이가 0이 되거나 옮긴 벽이 가구에 파고들면 옮기지 않는다. 같은 자리면 원본 그대로다.
 */
export function moveWallPoint(data: AppData, from: Point, to: Point): WallMoveResult {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  if (!space || (from.x === to.x && from.y === to.y)) return { ok: true, data };
  const walls = moveWallPoints(space.walls, from, to);
  const moved = walls.filter((wall, index) => wall !== space.walls[index]);
  if (moved.length === 0) return { ok: true, data };
  if (moved.some(hasZeroSegment)) return { ok: false, reason: "zeroLength" };
  if (moved.some((wall) => isWallBlocked(wall, space.boxes)))
    return { ok: false, reason: "blocked" };
  return { ok: true, data: updateCurrentSpace(data, (current) => ({ ...current, walls })) };
}
