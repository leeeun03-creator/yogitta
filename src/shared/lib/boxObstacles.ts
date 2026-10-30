import type { Box, Point, Wall } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import { rectCorners } from "./rectCorners";
import { wallQuads } from "./wallQuads";

/**
 * 가구 하나를 막는 것들의 바닥 모양(cm): 벽 선분마다 두께 사각형 + 그 가구를 뺀 다른 가구 사각형.
 * 구역 선은 3D에 서지 않으니 막지 않는다. 새로 놓을 가구면 exceptId는 null이다.
 */
export function boxObstacles(
  space: { walls: readonly Wall[]; boxes: readonly Box[] },
  exceptId: string | null,
): Point[][] {
  const others = space.boxes
    .filter((box) => box.id !== exceptId)
    .map((box) => rectCorners({ x: box.x, y: box.z }, boxFootprint(box))); // 2D y = 3D z
  return [...wallQuads(space.walls), ...others];
}
