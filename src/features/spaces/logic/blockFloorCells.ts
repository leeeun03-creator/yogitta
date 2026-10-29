import { ROOM_GRID_CM, ROOM_LINE_STEP_CM } from "@/shared/constants/room";
import { clamp } from "@/shared/lib/clamp";
import type { Floor, Point } from "@/shared/types";

/** 구획을 나누는 선: 벽(closed면 마지막 → 첫 점도) 또는 구역 선(열림). */
export type FloorLine = { points: Point[]; closed?: boolean };

/** 바닥을 덮는 격자. blocked[row * cols + col]이 1이면 벽·구역 선이 지나는 격자다. */
export type FloorGrid = { cols: number; rows: number; blocked: Uint8Array };

/** 선분 a → b를 짚어 가며 지나는 격자를 막는다. 격자를 건너뛰지 않아 대각선으로도 새지 않는다. */
function blockSegment(grid: FloorGrid, a: Point, b: Point) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / ROOM_LINE_STEP_CM));
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    // 바닥 밖 점은 건너뛴다 (바닥 테두리 위 점은 끝 격자로)
    if (x < 0 || y < 0 || x > grid.cols * ROOM_GRID_CM || y > grid.rows * ROOM_GRID_CM) continue;
    const col = clamp(Math.floor(x / ROOM_GRID_CM), 0, grid.cols - 1);
    const row = clamp(Math.floor(y / ROOM_GRID_CM), 0, grid.rows - 1);
    grid.blocked[row * grid.cols + col] = 1;
  }
}

/** 바닥을 10cm 격자로 나누고, 벽·구역 선이 지나는 격자를 막는다. */
export function blockFloorCells(floor: Floor, lines: FloorLine[]): FloorGrid {
  const cols = Math.max(1, Math.ceil(floor.w / ROOM_GRID_CM));
  const rows = Math.max(1, Math.ceil(floor.h / ROOM_GRID_CM));
  const grid = { cols, rows, blocked: new Uint8Array(cols * rows) };
  for (const line of lines) {
    const { points } = line;
    const count = line.closed ? points.length : points.length - 1;
    for (let index = 0; index < count; index++) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      if (a && b) blockSegment(grid, a, b);
    }
  }
  return grid;
}
