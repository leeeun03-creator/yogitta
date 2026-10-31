import type { Box, Point, Wall } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import type { HeightSpan } from "./heightSpan";
import { isStackedOn } from "./isStackedOn";
import { rectCorners } from "./rectCorners";
import { wallQuads } from "./wallQuads";

/**
 * 가구 하나를 막는 것들의 바닥 모양(cm): 벽 선분마다 두께 사각형 + 다른 가구 사각형.
 * span(그 가구가 차지할 높이)을 주면 높이가 겹치는 가구만 막는다. 맞닿는 높이는 막지 않아 받침 가구와 가구 위 가구,
 * 벽걸이와 그 아래 가구는 서로 막지 않는다(T29). 그 가구 위에 올린 가구는 같이 움직이니 막지 않는다.
 * 구역 선은 3D에 서지 않으니 막지 않는다. 새로 놓을 가구면 exceptId는 null이다.
 */
export function boxObstacles(
  space: { walls: readonly Wall[]; boxes: readonly Box[] },
  exceptId: string | null,
  span?: HeightSpan,
): Point[][] {
  const isOther = (box: Box) =>
    exceptId === null || (box.id !== exceptId && !isStackedOn(space.boxes, box.id, exceptId));
  const isBeside = (box: Box) =>
    !span || (box.elevation < span.top && span.bottom < box.elevation + box.h);
  const others = space.boxes
    .filter((box) => isOther(box) && isBeside(box))
    .map((box) => rectCorners({ x: box.x, y: box.z }, boxFootprint(box))); // 2D y = 3D z
  return [...wallQuads(space.walls), ...others];
}
