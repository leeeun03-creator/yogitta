import { ROOM_FLOOR_LIFT_CM } from "@/shared/constants/scene";

type Rect = { x: number; y: number; w: number; h: number }; // 2D 평면도 사각형 (cm)

/**
 * 구역을 칠할 2D 사각형들을 3D 바닥 위 삼각형 점 목록(x, y, z 반복)으로 바꾼다. 사각형 하나 = 삼각형 2개 = 점 6개.
 * 2D y는 3D z이고, 바닥과 겹쳐 깜빡이지 않게 바닥보다 살짝(격자선보다는 아래) 띄운다.
 */
export function roomFloorPoints(rects: readonly Rect[]): number[] {
  const y = ROOM_FLOOR_LIFT_CM;
  return rects.flatMap(({ x, y: z, w, h }) => {
    const [x0, x1, z0, z1] = [x, x + w, z, z + h];
    // 위(+y)에서 봐서 반시계 방향이 앞면이 되게 점을 놓는다
    return [x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0];
  });
}
