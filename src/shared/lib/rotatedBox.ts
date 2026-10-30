import { BOX_ROTATION_STEP, FULL_TURN } from "@/shared/constants/furniture";
import type { Box, Space } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import { boxObstacles } from "./boxObstacles";
import { clampBoxCenter } from "./clampBoxCenter";
import { isBoxBlocked } from "./isBoxBlocked";

/** 돌리지 못하는 까닭: 돌린 모양이 바닥보다 김(tooLong), 벽·다른 가구에 걸림(blocked). */
export type RotateBlock = "tooLong" | "blocked";
export type RotateResult = { ok: true; box: Box } | { ok: false; reason: RotateBlock };

/**
 * 가운데를 축으로 시계 방향 90도 돌린 가구. 바닥 가장자리에 붙은 가구는 돌리면 삐져나올 수 있어서 바닥 안으로 다시 당긴다.
 * 돌린 모양이 바닥보다 길거나, 벽·다른 가구에 파고들면 돌릴 수 없다 (맞닿는 것은 된다).
 */
export function rotatedBox(
  box: Box,
  space: Pick<Space, "floor" | "walls" | "boxes">,
): RotateResult {
  const rotation = (box.rotation + BOX_ROTATION_STEP) % FULL_TURN;
  const size = boxFootprint({ ...box, rotation });
  if (size.w > space.floor.w || size.d > space.floor.h) return { ok: false, reason: "tooLong" };
  const center = clampBoxCenter({ x: box.x, y: box.z }, size, space.floor);
  if (isBoxBlocked(center, size, boxObstacles(space, box.id)))
    return { ok: false, reason: "blocked" };
  return { ok: true, box: { ...box, rotation, x: center.x, z: center.y } }; // 2D y = 3D z
}
