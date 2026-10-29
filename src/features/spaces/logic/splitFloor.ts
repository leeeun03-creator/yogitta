import type { Floor } from "@/shared/types";
import { blockFloorCells, type FloorLine } from "./blockFloorCells";

export const BLOCKED = -1; // 벽·구역 선이 지나는 격자
const UNSET = -2; // 아직 구획 번호를 안 붙인 빈 격자

/**
 * 바닥을 나눈 구획. part[row * cols + col]은 그 격자가 든 구획 번호(0부터)이고,
 * 벽·구역 선이 지나는 격자는 -1이다.
 */
export type FloorParts = {
  cols: number;
  rows: number;
  part: Int32Array;
  count: number;
  lineX: Float64Array; // 막힌 격자 안에서 선이 지나는 자리의 평균 (cm)
  lineY: Float64Array;
};

/** 상하좌우 이웃 격자 (바닥 밖은 뺀다). 대각선은 이웃이 아니라 대각선 선 사이로 새지 않는다. */
function neighbors(cell: number, cols: number, rows: number): number[] {
  const col = cell % cols;
  const row = (cell - col) / cols;
  const result: number[] = [];
  if (col > 0) result.push(cell - 1);
  if (col < cols - 1) result.push(cell + 1);
  if (row > 0) result.push(cell - cols);
  if (row < rows - 1) result.push(cell + cols);
  return result;
}

/** start 격자와 이어진 빈 격자에 모두 같은 구획 번호를 붙인다. */
function fillPart(parts: FloorParts, start: number, id: number) {
  const stack = [start];
  parts.part[start] = id;
  for (let cell = stack.pop(); cell !== undefined; cell = stack.pop()) {
    for (const next of neighbors(cell, parts.cols, parts.rows)) {
      if (parts.part[next] !== UNSET) continue;
      parts.part[next] = id;
      stack.push(next);
    }
  }
}

/** 벽·구역 선·바닥 테두리로 바닥을 구획으로 나눈다. 10cm 격자에서 이어진 빈 격자끼리 한 구획이다. */
export function splitFloor(floor: Floor, lines: FloorLine[]): FloorParts {
  const { cols, rows, blocked, lineX, lineY } = blockFloorCells(floor, lines);
  const part = new Int32Array(cols * rows).map((_, cell) => (blocked[cell] ? BLOCKED : UNSET));
  const parts = { cols, rows, part, count: 0, lineX, lineY };
  for (let cell = 0; cell < part.length; cell++) {
    if (part[cell] !== UNSET) continue;
    fillPart(parts, cell, parts.count);
    parts.count++;
  }
  return parts;
}
