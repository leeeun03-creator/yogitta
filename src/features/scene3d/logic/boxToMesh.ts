import { BOX_HANDLE_3D } from "@/shared/constants/scene";
import { DEG_TO_RAD } from "@/shared/constants/units";
import type { Box } from "@/shared/types";

/** 3D로 세울 가구 하나. 위치·크기는 cm, 바닥 위 가운데 기준이다. */
export type BoxMesh = {
  key: string; // 가구 id
  x: number; // 3D x = 2D x
  z: number; // 3D z = 2D y
  base: number; // 가구 아랫면 높이 (설치 높이)
  w: number; // 로컬 x (가로)
  h: number;
  d: number; // 로컬 z (깊이). 로컬 +z 쪽이 정면이다
  rotationY: number; // y축 회전 (라디안)
  handle: { width: number; height: number; y: number; z: number }; // 정면 손잡이 홈 (가구 로컬 좌표)
};

/**
 * 가구를 3D 박스로 바꾼다. 2D 평면도에서 시계 방향 θ도 돌리면 정면(+y)이 (-sin θ, cos θ)로 가고,
 * three.js에서 y축으로 φ 돌리면 로컬 +z가 (sin φ, cos φ)로 가므로 2D와 같은 쪽을 보게 φ = -θ로 돌린다.
 */
export function boxToMesh(box: Box): BoxMesh {
  const { widthRatio, maxWidth, height, heightRatio, depth } = BOX_HANDLE_3D;
  return {
    key: box.id,
    x: box.x,
    z: box.z,
    base: box.elevation,
    w: box.w,
    h: box.h,
    d: box.d,
    rotationY: -box.rotation * DEG_TO_RAD,
    handle: {
      width: Math.min(box.w * widthRatio, maxWidth),
      height: Math.min(height, box.h / 2), // 아주 낮은 가구에서도 가구 높이를 넘지 않게
      y: box.h * heightRatio,
      z: box.d / 2 + depth / 2, // 정면에 붙여 반만큼 나오게
    },
  };
}
