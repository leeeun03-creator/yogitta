import { DEG_TO_RAD } from "@/shared/constants/units";
import type { Box } from "@/shared/types";
import type { FurniturePart } from "./furniturePart";
import { furnitureParts } from "./furnitureParts";

/** 3D로 세울 가구 하나. 위치는 cm, 바닥 위 가운데 기준이다. */
export type BoxMesh = {
  key: string; // 가구 id
  name: string; // 이름 라벨
  x: number; // 3D x = 2D x
  z: number; // 3D z = 2D y
  base: number; // 가구 아랫면 높이 (설치 높이)
  rotationY: number; // y축 회전 (라디안)
  parts: FurniturePart[]; // 종류별 모양 (가구 로컬 좌표, 로컬 +z 쪽이 정면)
  top: number; // 가장 높은 부품의 윗면 (base부터, 이름 라벨을 이 위에 띄운다)
};

/**
 * 가구를 3D 모양으로 바꾼다. 2D 평면도에서 시계 방향 θ도 돌리면 정면(+y)이 (-sin θ, cos θ)로 가고,
 * three.js에서 y축으로 φ 돌리면 로컬 +z가 (sin φ, cos φ)로 가므로 2D와 같은 쪽을 보게 φ = -θ로 돌린다.
 */
export function boxToMesh(box: Box): BoxMesh {
  const parts = furnitureParts(box);
  return {
    key: box.id,
    name: box.name,
    x: box.x,
    z: box.z,
    base: box.elevation,
    rotationY: -box.rotation * DEG_TO_RAD,
    parts,
    top: Math.max(0, ...parts.map((part) => part.position[1] + part.size[1] / 2)),
  };
}
