import { BOX_ROTATION_STEP, FULL_TURN } from "@/shared/constants/furniture";
import type { Box, Floor } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import { clampBoxCenter } from "./clampBoxCenter";

/** 가운데를 축으로 시계 방향 90도 돌린 가구. 돌린 모양이 바닥보다 커서 들어갈 수 없으면 null. */
export function rotatedBox(box: Box, floor: Floor): Box | null {
  const rotation = (box.rotation + BOX_ROTATION_STEP) % FULL_TURN;
  const size = boxFootprint({ ...box, rotation });
  if (size.w > floor.w || size.d > floor.h) return null;
  // 바닥 가장자리에 붙은 가구는 돌리면 삐져나올 수 있어서 바닥 안으로 다시 당긴다
  const center = clampBoxCenter({ x: box.x, y: box.z }, size, floor);
  return { ...box, rotation, x: center.x, z: center.y }; // 2D y = 3D z
}
