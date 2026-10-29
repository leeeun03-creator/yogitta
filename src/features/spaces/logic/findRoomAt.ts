import type { Floor, Point } from "@/shared/types";
import type { FloorLine } from "./blockFloorCells";
import { partAt } from "./partAt";
import type { RoomAnchors } from "./roomAreas";
import { splitFloor } from "./splitFloor";

/** 2D 평면도를 누른 자리: 이미 구역인 구획(room), 이름 없는 구획(new), 벽·구역 선 위나 바닥 밖(null). */
export type RoomHit = { type: "room"; room: string } | { type: "new"; at: Point } | null;

/** 누른 자리(cm)가 어느 구역의 구획인지 찾는다. 같은 구획에 구역이 여럿이면 목록 앞의 것이다. */
export function findRoomAt(
  floor: Floor,
  lines: FloorLine[],
  rooms: readonly string[],
  anchors: RoomAnchors,
  point: Point,
): RoomHit {
  const parts = splitFloor(floor, lines);
  const id = partAt(parts, point);
  if (id === null) return null;
  const room = rooms.find((name) => {
    const anchor = anchors[name];
    return anchor !== undefined && partAt(parts, anchor) === id;
  });
  return room ? { type: "room", room } : { type: "new", at: point };
}
