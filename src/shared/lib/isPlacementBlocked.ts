import type { Space } from "@/shared/types";
import { boxObstacles } from "./boxObstacles";
import { fitBoxPlacement, type BoxPlacement } from "./fitBoxPlacement";
import { isBoxBlocked } from "./isBoxBlocked";

/** 새 가구를 그 자리(바닥 안으로 맞춘 자리)에 놓으면 벽·다른 가구에 파고드는지. 맞닿는 것은 된다. */
export function isPlacementBlocked(
  placement: BoxPlacement,
  space: Pick<Space, "floor" | "walls" | "boxes">,
): boolean {
  const { center, w, d } = fitBoxPlacement(placement, space.floor);
  return isBoxBlocked(center, { w, d }, boxObstacles(space, null));
}
