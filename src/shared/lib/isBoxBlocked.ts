import type { Point } from "@/shared/types";
import type { Footprint } from "./boxFootprint";
import { convexOverlap } from "./convexOverlap";
import { rectCorners } from "./rectCorners";

/** 가운데가 center(cm)이고 size만큼 차지하는 가구가 막는 것(벽·다른 가구 모양) 중 하나에라도 파고드는지. 맞닿는 것은 된다. */
export function isBoxBlocked(
  center: Point,
  size: Footprint,
  obstacles: readonly (readonly Point[])[],
): boolean {
  const corners = rectCorners(center, size);
  return obstacles.some((obstacle) => convexOverlap(corners, obstacle));
}
