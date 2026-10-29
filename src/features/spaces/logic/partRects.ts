import { ROOM_GRID_CM } from "@/shared/constants/room";
import type { Floor } from "@/shared/types";

/** 칠할 사각형 하나 (cm). */
export type Rect = { x: number; y: number; w: number; h: number };

/**
 * 구획 번호가 id인 격자를 줄마다 이어진 가로 띠 사각형으로 묶는다 (격자마다 사각형을 그리지 않게).
 * 바닥이 10cm로 나눠떨어지지 않으면 마지막 격자는 바닥 끝에서 자른다.
 */
export function partRects(owned: Int32Array, cols: number, floor: Floor, id: number): Rect[] {
  const rects: Rect[] = [];
  const rows = owned.length / cols;
  for (let row = 0; row < rows; row++) {
    let start = -1;
    for (let col = 0; col <= cols; col++) {
      const isMine = col < cols && owned[row * cols + col] === id;
      if (isMine && start < 0) start = col;
      if (isMine || start < 0) continue;
      const x = start * ROOM_GRID_CM;
      const y = row * ROOM_GRID_CM;
      const w = Math.min(col * ROOM_GRID_CM, floor.w) - x;
      rects.push({ x, y, w, h: Math.min(ROOM_GRID_CM, floor.h - y) });
      start = -1;
    }
  }
  return rects;
}
