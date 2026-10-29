import type { Floor, Point } from "@/shared/types";
import type { FloorLine } from "./blockFloorCells";
import { ownedParts } from "./ownedParts";
import { partAt } from "./partAt";
import { partRects, type Rect } from "./partRects";
import { roomColor } from "./roomColor";
import { splitFloor } from "./splitFloor";

/** 2D 평면도·3D 바닥에 칠할 구역 하나: 이름, 색, 이름을 쓸 자리(구역 기준점), 칠할 사각형들 (cm). */
export type RoomArea = { room: string; color: string; label: Point; rects: Rect[] };

/** 구역 이름 → 구역 기준점. */
export type RoomAnchors = Readonly<Record<string, Point>>;

/**
 * 구역마다 기준점이 든 구획을 찾아 칠할 모양을 만든다. 색은 구역 목록 순서대로.
 * 기준점이 없거나 선 위에 있는 구역, 앞 구역과 같은 구획이 된 구역(벽을 지워 합쳐짐)은 빼서 먼저 붙인 이름만 보인다.
 */
export function roomAreas(
  floor: Floor,
  lines: FloorLine[],
  rooms: readonly string[],
  anchors: RoomAnchors = {},
): RoomArea[] {
  const parts = splitFloor(floor, lines);
  const owned = ownedParts(parts);
  const used = new Set<number>();
  const areas: RoomArea[] = [];
  rooms.forEach((room, index) => {
    const anchor = anchors[room];
    const id = anchor ? partAt(parts, anchor) : null;
    if (!anchor || id === null || used.has(id)) return;
    used.add(id);
    const rects = partRects(owned, parts.cols, floor, id);
    areas.push({ room, color: roomColor(index), label: anchor, rects });
  });
  return areas;
}
