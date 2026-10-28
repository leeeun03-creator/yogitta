import { CAMERA_DIRECTION, CAMERA_FIT_MARGIN, WALL_HEIGHT_CM } from "@/shared/constants/scene";
import type { Floor } from "@/shared/types";

type Vector = [x: number, y: number, z: number];
export type CameraStart = { position: Vector; target: Vector; near: number; far: number };

const NEAR_RATIO = 0.01; // 가까운 면 = 거리의 1%
const FAR_RATIO = 4; // 먼 면 = 거리의 4배 (줌아웃 여유)

/** 바닥 전체(벽 높이까지)가 보이도록 대각선 위에서 바닥 가운데를 보는 처음 카메라. aspect = 가로 / 세로. */
export function startCamera(floor: Floor, fovDeg: number, aspect: number): CameraStart {
  const target: Vector = [floor.w / 2, 0, floor.h / 2];
  // 바닥 가운데에서 벽 윗모서리 끝까지를 감싸는 구
  const radius = Math.hypot(floor.w / 2, floor.h / 2, WALL_HEIGHT_CM);
  const halfVertical = (fovDeg * Math.PI) / 360;
  const safeAspect = aspect > 0 && Number.isFinite(aspect) ? aspect : 1;
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * safeAspect);
  const distance = (radius * CAMERA_FIT_MARGIN) / Math.sin(Math.min(halfVertical, halfHorizontal));

  const { x, y, z } = CAMERA_DIRECTION;
  const length = Math.hypot(x, y, z);
  const position: Vector = [
    target[0] + (x / length) * distance,
    target[1] + (y / length) * distance,
    target[2] + (z / length) * distance,
  ];
  return { position, target, near: distance * NEAR_RATIO, far: distance * FAR_RATIO };
}
