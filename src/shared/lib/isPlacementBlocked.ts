import { BOX_DEFAULT_SIZE, FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import type { Space } from "@/shared/types";
import { boxObstacles } from "./boxObstacles";
import { fitBoxPlacement, type BoxPlacement } from "./fitBoxPlacement";
import { heightSpan } from "./heightSpan";
import { isBoxBlocked } from "./isBoxBlocked";

// 새 가구는 보관함 기본 설치 높이·높이로 놓인다 (addBox)
const NEW_BOX_SPAN = heightSpan({
  elevation: FURNITURE_DEFAULTS.box.elevation,
  h: BOX_DEFAULT_SIZE.h,
});

/** 새 가구를 그 자리(바닥 안으로 맞춘 자리)에 놓으면 벽·높이가 겹치는 다른 가구에 파고드는지. 맞닿는 것은 된다. */
export function isPlacementBlocked(
  placement: BoxPlacement,
  space: Pick<Space, "floor" | "walls" | "boxes">,
): boolean {
  const { center, w, d } = fitBoxPlacement(placement, space.floor);
  return isBoxBlocked(center, { w, d }, boxObstacles(space, null, NEW_BOX_SPAN));
}
