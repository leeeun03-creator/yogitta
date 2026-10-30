import { BOX_ROTATION_STEP } from "@/shared/constants/furniture";
import type { Box } from "@/shared/types";

/** 가구가 바닥에서 차지하는 크기 (cm). w는 2D x 방향, d는 2D y 방향이다. */
export type Footprint = { w: number; d: number };

/** 돌린 가구가 바닥에서 차지하는 크기. 90·270도면 가로와 깊이가 바뀐다. */
export function boxFootprint(box: Pick<Box, "w" | "d" | "rotation">): Footprint {
  const isQuarterTurned = (box.rotation / BOX_ROTATION_STEP) % 2 === 1;
  return isQuarterTurned ? { w: box.d, d: box.w } : { w: box.w, d: box.d };
}
