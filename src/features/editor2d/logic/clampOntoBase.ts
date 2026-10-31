import { boxFootprint } from "@/shared/lib/boxFootprint";
import { clamp } from "@/shared/lib/clamp";
import type { Box, Point } from "@/shared/types";

/** 가구 위 가구 가운데(cm)를 받침 가구 윗면 안으로 당긴다. 가운데만 윗면 안이면 되고 가장자리는 삐져나와도 된다. */
export function clampOntoBase(center: Point, base: Box): Point {
  const size = boxFootprint(base);
  return {
    x: clamp(center.x, base.x - size.w / 2, base.x + size.w / 2),
    y: clamp(center.y, base.z - size.d / 2, base.z + size.d / 2), // 2D y = 3D z
  };
}
