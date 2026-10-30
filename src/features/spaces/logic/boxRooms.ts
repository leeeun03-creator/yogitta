import type { Space } from "@/shared/types";
import { ownedParts } from "./ownedParts";
import { partAt } from "./partAt";
import { splitFloor, type FloorParts } from "./splitFloor";

/** 구획 번호 → 구역 이름. 같은 구획에 구역이 여럿이면(벽을 지워 합쳐짐) 목록 앞의 것이다. */
function partRooms(parts: FloorParts, space: Space): Map<number, string> {
  const result = new Map<number, string>();
  for (const room of space.rooms) {
    const anchor = space.roomAnchors?.[room];
    const id = anchor && partAt(parts, anchor);
    if (id !== undefined && id !== null && !result.has(id)) result.set(id, room);
  }
  return result;
}

/**
 * 가구마다 놓인 구역 (가구 id → 구역 이름, 구역이 없으면 빠진다). 저장하지 않고 그때그때 계산해서
 * 구역 선을 나중에 긋거나 구역 이름을 바꿔도 따라간다. 가구 가운데 점이 든 구획의 구역이고,
 * 가운데가 벽·구역 선 위면 2D 평면도에서 그 자리를 칠한 구획(선 반대쪽 이웃)으로 본다.
 */
export function boxRooms(space: Space): Map<string, string> {
  const parts = splitFloor(space.floor, [...space.walls, ...(space.roomLines ?? [])]);
  const owned = { ...parts, part: ownedParts(parts) };
  const rooms = partRooms(parts, space);
  const result = new Map<string, string>();
  for (const box of space.boxes) {
    const id = partAt(owned, { x: box.x, y: box.z }); // 2D y = 3D z
    const room = id === null ? undefined : rooms.get(id);
    if (room !== undefined) result.set(box.id, room);
  }
  return result;
}
