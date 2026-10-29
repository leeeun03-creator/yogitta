import { ROOM_GRID_CM } from "@/shared/constants/room";
import { BLOCKED, type FloorParts } from "./splitFloor";

/**
 * 막힌 격자의 이웃을 붙일 순서로 늘어놓는다. 선이 격자의 한쪽(예: 왼쪽 끝)을 지나면 격자는 대부분 반대쪽(오른쪽)이라
 * 그쪽 이웃을 먼저 본다. 선이 가운데를 지나면 왼쪽 → 위 → 오른쪽 → 아래 순서다.
 */
function neighborOrder(parts: FloorParts, cell: number): number[] {
  const { cols, rows } = parts;
  const col = cell % cols;
  const row = (cell - col) / cols;
  const dx = (col + 1 / 2) * ROOM_GRID_CM - (parts.lineX[cell] ?? 0);
  const dy = (row + 1 / 2) * ROOM_GRID_CM - (parts.lineY[cell] ?? 0);
  const left = col > 0 ? cell - 1 : -1;
  const right = col < cols - 1 ? cell + 1 : -1;
  const up = row > 0 ? cell - cols : -1;
  const down = row < rows - 1 ? cell + cols : -1;
  const across = dx > 0 ? [right, left] : [left, right];
  const along = dy > 0 ? [down, up] : [up, down];
  if (dx === 0 && dy === 0) return [left, up, right, down];
  return Math.abs(dx) >= Math.abs(dy) ? [...across, ...along] : [...along, ...across];
}

/**
 * 벽·구역 선이 지나는 격자를 이웃 구획에 붙인 구획 번호. 칠할 때 선 옆에 빈 띠가 생기지 않게 하고,
 * 선 반대쪽 구획에 붙여 색이 선을 넘어 삐져나오지 않게 한다. 이웃이 모두 막힌 격자는 그대로 -1이다.
 */
export function ownedParts(parts: FloorParts): Int32Array {
  const { part } = parts;
  return part.map((id, cell) => {
    if (id !== BLOCKED) return id;
    const owner = neighborOrder(parts, cell)
      .map((next) => (next >= 0 ? part[next] : undefined))
      .find((next) => next !== undefined && next !== BLOCKED);
    return owner ?? BLOCKED;
  });
}
