import { FOCUS } from "@/shared/constants/scene";
import { DEG_TO_RAD } from "@/shared/constants/units";
import type { Box } from "@/shared/types";
import type { CameraLimits, CameraView } from "./cameraView";
import type { Vector } from "./startCamera";

type Lens = { fovDeg: number; aspect: number }; // 세로 화각, 가로 / 세로

/** 가구 정면에서 FOCUS.yawDeg 옆으로, FOCUS.elevationDeg 위에서 가구를 보는 방향 (길이 1). 2D 정면 (-sin θ, cos θ). */
function viewDirection(rotationDeg: number): Vector {
  const yaw = (rotationDeg - FOCUS.yawDeg) * DEG_TO_RAD;
  const elevation = FOCUS.elevationDeg * DEG_TO_RAD;
  const flat = Math.cos(elevation);
  return [-Math.sin(yaw) * flat, Math.sin(elevation), Math.cos(yaw) * flat];
}

/** 화면 세로·가로 중 좁은 쪽 반 화각 (라디안). */
function halfAngle({ fovDeg, aspect }: Lens): number {
  const halfVertical = (fovDeg * DEG_TO_RAD) / 2;
  const safeAspect = aspect > 0 && Number.isFinite(aspect) ? aspect : 1;
  return Math.min(halfVertical, Math.atan(Math.tan(halfVertical) * safeAspect));
}

/**
 * 찾은 가구를 보는 카메라 (T15). 가구 정면 쪽 비스듬히 위에서 가구를 감싸는 구가 화면에 차게 보고, 가구 가운데가
 * 화면 가운데에 오게 한다. 보는 곳은 시선이 바닥과 만나는 점이라 바닥 위에 있다 (사용자 이동과 같은 규칙).
 * 보는 곳까지의 거리는 카메라 움직임 범위 안으로 맞춘다.
 */
export function focusView(box: Box, lens: Lens, limits: CameraLimits): CameraView {
  const direction = viewDirection(box.rotation);
  const center: Vector = [box.x, box.elevation + box.h / 2, box.z];
  const radius = Math.hypot(box.w, box.h, box.d) / 2;
  const toFloor = center[1] / direction[1]; // 가구 가운데에서 시선을 따라 바닥까지
  const target: Vector = [
    center[0] - direction[0] * toFloor,
    0,
    center[2] - direction[2] * toFloor,
  ];
  const fit = (radius * FOCUS.margin) / Math.sin(halfAngle(lens)) + toFloor;
  const distance = Math.min(limits.maxDistance, Math.max(limits.minDistance, fit));
  const position: Vector = [
    target[0] + direction[0] * distance,
    target[1] + direction[1] * distance,
    target[2] + direction[2] * distance,
  ];
  return { position, target };
}
