import {
  CAMERA_MAX_DISTANCE_RATIO,
  CAMERA_MAX_POLAR_DEG,
  CAMERA_MIN_DISTANCE_CM,
  CAMERA_SAME_CM,
  CAMERA_ZOOM_STEP,
} from "@/shared/constants/scene";
import { DEG_TO_RAD } from "@/shared/constants/units";
import type { Floor } from "@/shared/types";
import type { CameraStart, Vector } from "./startCamera";

/** 카메라를 움직일 수 있는 범위. 거리는 cm, 각도는 라디안(0 = 바로 위). */
export type CameraLimits = {
  minDistance: number;
  maxDistance: number;
  maxPolarAngle: number;
};
/** 카메라 자리와 보는 곳 (cm). */
export type CameraView = { position: Vector; target: Vector };
/** 지금 카메라 상태. 처음 보기·확대·축소 버튼을 막을지 정한다. */
export type ViewStatus = { isStart: boolean; canZoomIn: boolean; canZoomOut: boolean };
export type ZoomDirection = "in" | "out";

/** 두 점 사이 거리 (cm). */
export const distanceBetween = (a: Vector, b: Vector) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** 처음 카메라에 맞춘 움직임 범위. 아주 작은 바닥에서도 처음 거리보다 가까운 끝이 멀지 않게 한다. */
export function cameraLimits(start: CameraStart): CameraLimits {
  const startDistance = distanceBetween(start.position, start.target);
  return {
    minDistance: Math.min(CAMERA_MIN_DISTANCE_CM, startDistance),
    maxDistance: startDistance * CAMERA_MAX_DISTANCE_RATIO,
    maxPolarAngle: CAMERA_MAX_POLAR_DEG * DEG_TO_RAD,
  };
}

/** 확대(in)·축소(out) 한 번 뒤의 거리. 범위 끝에서 멈춘다. */
export function zoomDistance(distance: number, direction: ZoomDirection, limits: CameraLimits) {
  const next = direction === "in" ? distance / CAMERA_ZOOM_STEP : distance * CAMERA_ZOOM_STEP;
  return Math.min(limits.maxDistance, Math.max(limits.minDistance, next));
}

/** 카메라 자리·보는 곳으로 지금 상태를 판단한다. */
export function viewStatus(view: CameraView, start: CameraStart, limits: CameraLimits): ViewStatus {
  const distance = distanceBetween(view.position, view.target);
  return {
    isStart:
      distanceBetween(view.position, start.position) < CAMERA_SAME_CM &&
      distanceBetween(view.target, start.target) < CAMERA_SAME_CM,
    canZoomIn: distance > limits.minDistance + CAMERA_SAME_CM,
    canZoomOut: distance < limits.maxDistance - CAMERA_SAME_CM,
  };
}

/** 이동으로 보는 곳이 바닥 밖으로 나가지 않게 바닥 안(바닥 높이)으로 당긴다. */
export function clampTarget(target: Vector, floor: Floor): Vector {
  return [Math.min(floor.w, Math.max(0, target[0])), 0, Math.min(floor.h, Math.max(0, target[2]))];
}

/** 보는 곳은 그대로 두고, 확대(in)·축소(out) 한 번만큼 카메라를 보는 곳 쪽으로 당기거나 민다. */
export function zoomView(
  view: CameraView,
  direction: ZoomDirection,
  limits: CameraLimits,
): CameraView {
  const { position, target } = view;
  const distance = distanceBetween(position, target);
  if (distance === 0) return view;
  const ratio = zoomDistance(distance, direction, limits) / distance;
  return {
    position: [
      target[0] + (position[0] - target[0]) * ratio,
      target[1] + (position[1] - target[1]) * ratio,
      target[2] + (position[2] - target[2]) * ratio,
    ],
    target,
  };
}

/** 보는 곳이 바닥 밖이면 카메라째 바닥 안으로 옮긴다. 바닥 안이면 받은 view를 그대로 돌려준다. */
export function keepViewOnFloor(view: CameraView, floor: Floor): CameraView {
  const { position, target } = view;
  const next = clampTarget(target, floor);
  const shift = [next[0] - target[0], next[1] - target[1], next[2] - target[2]];
  if (shift.every((value) => value === 0)) return view;
  return {
    position: [
      position[0] + (shift[0] ?? 0),
      position[1] + (shift[1] ?? 0),
      position[2] + (shift[2] ?? 0),
    ],
    target: next,
  };
}

/** 두 카메라 사이 (t = 0이면 from, 1이면 to). 카메라 자리와 보는 곳을 함께 옮긴다. */
export function lerpView(from: CameraView, to: CameraView, t: number): CameraView {
  const mix = (a: Vector, b: Vector): Vector => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
  return { position: mix(from.position, to.position), target: mix(from.target, to.target) };
}
