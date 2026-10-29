import { ROOM_GRID_CM, ROOM_LINE_STEP_CM } from "@/shared/constants/room";
import { clamp } from "@/shared/lib/clamp";
import { lineSegments } from "@/shared/lib/lineSegments";
import type { Floor, Point } from "@/shared/types";

/** 구획을 나누는 선: 벽(closed면 마지막 → 첫 점도) 또는 구역 선(열림). */
export type FloorLine = { points: Point[]; closed?: boolean };

/**
 * 바닥을 덮는 격자. blocked[row * cols + col]이 1이면 벽·구역 선이 지나는 격자다.
 * lineX·lineY는 그 격자 안에서 선이 지나는 자리의 평균(cm)이다. 칠할 때 선 반대쪽 구획에 격자를 붙이는 데 쓴다.
 */
export type FloorGrid = {
  cols: number;
  rows: number;
  blocked: Uint8Array;
  lineX: Float64Array;
  lineY: Float64Array;
};

type Sums = { x: Float64Array; y: Float64Array; count: Uint32Array };

/** 선분 a → b를 짚어 가며 지나는 격자를 막는다. 격자를 건너뛰지 않아 대각선으로도 새지 않는다. */
function blockSegment(grid: FloorGrid, sums: Sums, a: Point, b: Point) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / ROOM_LINE_STEP_CM));
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    // 바닥 밖 점은 건너뛴다 (바닥 테두리 위 점은 끝 격자로)
    if (x < 0 || y < 0 || x > grid.cols * ROOM_GRID_CM || y > grid.rows * ROOM_GRID_CM) continue;
    const col = clamp(Math.floor(x / ROOM_GRID_CM), 0, grid.cols - 1);
    const row = clamp(Math.floor(y / ROOM_GRID_CM), 0, grid.rows - 1);
    const cell = row * grid.cols + col;
    grid.blocked[cell] = 1;
    sums.x[cell] = (sums.x[cell] ?? 0) + x;
    sums.y[cell] = (sums.y[cell] ?? 0) + y;
    sums.count[cell] = (sums.count[cell] ?? 0) + 1;
  }
}

/** 바닥을 10cm 격자로 나누고, 벽·구역 선이 지나는 격자를 막는다. */
export function blockFloorCells(floor: Floor, lines: FloorLine[]): FloorGrid {
  const cols = Math.max(1, Math.ceil(floor.w / ROOM_GRID_CM));
  const rows = Math.max(1, Math.ceil(floor.h / ROOM_GRID_CM));
  const size = cols * rows;
  const sums = {
    x: new Float64Array(size),
    y: new Float64Array(size),
    count: new Uint32Array(size),
  };
  const grid = { cols, rows, blocked: new Uint8Array(size), lineX: sums.x, lineY: sums.y };
  for (const [a, b] of lines.flatMap(lineSegments)) blockSegment(grid, sums, a, b);
  // 합 → 평균 (선이 안 지나는 격자는 0으로 둔다)
  sums.count.forEach((count, cell) => {
    if (count === 0) return;
    sums.x[cell] = (sums.x[cell] ?? 0) / count;
    sums.y[cell] = (sums.y[cell] ?? 0) / count;
  });
  return grid;
}
