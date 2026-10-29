import { WALL_HEIGHT_CM, WALL_THICKNESS_CM } from "@/shared/constants/scene";
import { lineSegments } from "@/shared/lib/lineSegments";
import type { Point, Wall } from "@/shared/types";

/** 선분 하나로 세우는 3D 벽 박스. 위치·크기는 cm, 바닥 위 가운데 기준이다. */
export type WallBox = {
  key: string; // 벽 id + 선분 번호
  x: number; // 3D x = 2D x
  z: number; // 3D z = 2D y
  length: number; // 박스의 로컬 x 방향 길이
  height: number;
  thickness: number;
  rotationY: number; // y축 회전 (라디안)
};

/** 선분(a → b)을 벽 박스로 바꾼다. 길이 0이면 null. */
function segmentToBox(key: string, a: Point, b: Point): WallBox | null {
  const dx = b.x - a.x;
  const dz = b.y - a.y; // 2D y = 3D z
  const length = Math.hypot(dx, dz);
  if (length === 0) return null;
  return {
    key,
    x: (a.x + b.x) / 2,
    z: (a.y + b.y) / 2,
    length,
    height: WALL_HEIGHT_CM,
    thickness: WALL_THICKNESS_CM,
    // y축으로 θ 돌리면 로컬 x축이 (cos θ, 0, -sin θ)가 되므로, 선분 방향 (dx, dz)에 맞추려면 θ = -atan2(dz, dx)
    rotationY: -Math.atan2(dz, dx),
  };
}

/** 벽의 점 목록을 선분마다 벽 박스로 바꾼다. 닫힌 벽은 마지막 점 → 첫 점 선분도 만든다. */
export function wallToBoxes(wall: Wall): WallBox[] {
  if (wall.points.length < 2) return [];
  return lineSegments(wall)
    .map(([a, b], segment) => segmentToBox(`${wall.id}:${segment}`, a, b))
    .filter((box): box is WallBox => box !== null);
}
