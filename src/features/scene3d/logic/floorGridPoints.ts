import { FLOOR_GRID_LIFT_CM } from "@/shared/constants/scene";
import { gridLines } from "@/shared/lib/gridLines";
import type { Floor } from "@/shared/types";

/** 3D 바닥 50cm 격자선의 선분 끝점들 (x, y, z 차례로). 2D 평면도 격자와 같은 자리, 2D y = 3D z. */
export function floorGridPoints(floor: Floor): number[] {
  const y = FLOOR_GRID_LIFT_CM;
  return [
    ...gridLines(floor.w).flatMap((x) => [x, y, 0, x, y, floor.h]),
    ...gridLines(floor.h).flatMap((z) => [0, y, z, floor.w, y, z]),
  ];
}
