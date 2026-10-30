import type { Box, Wall } from "@/shared/types";
import { boxObstacles } from "./boxObstacles";
import { convexOverlap } from "./convexOverlap";
import { wallQuads } from "./wallQuads";

/**
 * 벽(그리는 중인 선 포함)이 가구에 파고드는지. 맞닿는 것(벽 면에 가구 면이 붙음)은 된다.
 * 벽끼리는 이어 그리므로 보지 않는다. 점이 하나뿐이면 선분이 없어 막히지 않는다.
 */
export function isWallBlocked(
  wall: Pick<Wall, "points" | "closed">,
  boxes: readonly Box[],
): boolean {
  const boxShapes = boxObstacles({ walls: [], boxes }, null); // 벽 없이 가구 사각형만
  return wallQuads([wall]).some((quad) => boxShapes.some((shape) => convexOverlap(quad, shape)));
}
