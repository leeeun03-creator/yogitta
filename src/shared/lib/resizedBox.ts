import { BOX_MAX_HEIGHT_CM, BOX_MIN_SIZE_CM } from "@/shared/constants/furniture";
import type { Box, Space } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import { boxObstacles } from "./boxObstacles";
import { clampBoxCenter } from "./clampBoxCenter";
import { isBoxBlocked } from "./isBoxBlocked";

/** 가구 크기 (cm, 돌리기 전 가로·깊이와 높이). */
export type BoxSize = Pick<Box, "w" | "d" | "h">;
/** 크기를 못 바꾸는 까닭: 최소보다 작음, 바닥보다 김, 너무 높음, 벽·다른 가구에 걸림. */
export type ResizeBlock = "tooSmall" | "tooLong" | "tooTall" | "blocked";
export type ResizeResult = { ok: true; box: Box } | { ok: false; reason: ResizeBlock };

/**
 * 크기를 바꾼 가구. 가운데는 그대로 두고, 바닥 가장자리라 삐져나오면 바닥 안으로 당긴다.
 * 돌린 가구는 돌린 모양(가로·깊이를 바꾼 것)으로 바닥·겹침을 본다. 높이가 바뀌면 정해 둔 칸 높이는 지운다.
 */
export function resizedBox(
  box: Box,
  size: BoxSize,
  space: Pick<Space, "floor" | "walls" | "boxes">,
): ResizeResult {
  if (Math.min(size.w, size.d, size.h) < BOX_MIN_SIZE_CM) return { ok: false, reason: "tooSmall" };
  if (size.h > BOX_MAX_HEIGHT_CM) return { ok: false, reason: "tooTall" };
  const footprint = boxFootprint({ ...box, ...size });
  if (footprint.w > space.floor.w || footprint.d > space.floor.h) {
    return { ok: false, reason: "tooLong" };
  }
  const center = clampBoxCenter({ x: box.x, y: box.z }, footprint, space.floor); // 2D y = 3D z
  if (isBoxBlocked(center, footprint, boxObstacles(space, box.id))) {
    return { ok: false, reason: "blocked" };
  }
  const next: Box = { ...box, ...size, x: center.x, z: center.y };
  if (size.h !== box.h) delete next.rowHeights;
  return { ok: true, box: next };
}
