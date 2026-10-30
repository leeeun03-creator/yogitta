import { ROTATE_HANDLE_OFFSET_PX } from "@/shared/constants/floorPlan";
import { DEG_TO_RAD } from "@/shared/constants/units";
import type { Box, Point } from "@/shared/types";

/**
 * 고른 가구 회전 핸들 가운데 (cm). 정면 반대쪽 가장자리에서 화면 ROTATE_HANDLE_OFFSET_PX만큼 떨어져 있다.
 * 돌리기 전 정면은 +y라 핸들은 -y 쪽이고, 2D 평면도처럼 시계 방향(y가 아래)으로 돌린다.
 */
export function rotateHandleAt(box: Box, cmPerPx: number): Point {
  const distance = box.d / 2 + ROTATE_HANDLE_OFFSET_PX * cmPerPx;
  const angle = box.rotation * DEG_TO_RAD;
  // (0, -distance)를 돌린다. 회전은 90도씩이라 반올림해 소수 오차를 없앤다
  return {
    x: box.x + Math.round(Math.sin(angle)) * distance,
    y: box.z - Math.round(Math.cos(angle)) * distance,
  };
}
