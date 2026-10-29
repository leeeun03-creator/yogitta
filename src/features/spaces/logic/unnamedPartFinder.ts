import type { Floor, Point } from "@/shared/types";
import type { FloorLine } from "./blockFloorCells";
import { ownedParts } from "./ownedParts";
import { partAt } from "./partAt";
import { partRects, type Rect } from "./partRects";
import type { RoomAnchors } from "./roomAreas";
import { splitFloor } from "./splitFloor";

/**
 * 점(cm)이 든 이름 없는 구획의 칠할 사각형들을 찾는 함수를 만든다. 구역인 구획·벽·구역 선 위·바닥 밖은 null이다.
 * 마우스를 움직일 때마다 부르므로 구획 계산은 만들 때 한 번만 하고, 구획마다 사각형을 한 번만 만들어 같은 배열을 돌려준다.
 */
export function unnamedPartFinder(
  floor: Floor,
  lines: FloorLine[],
  rooms: readonly string[],
  anchors: RoomAnchors = {},
): (point: Point) => Rect[] | null {
  const parts = splitFloor(floor, lines);
  const owned = ownedParts(parts);
  const named = new Set(
    rooms.map((room) => anchors[room]).map((anchor) => anchor && partAt(parts, anchor)),
  );
  const cache = new Map<number, Rect[]>();
  return (point) => {
    const id = partAt(parts, point);
    if (id === null || named.has(id)) return null;
    const rects = cache.get(id) ?? partRects(owned, parts.cols, floor, id);
    cache.set(id, rects);
    return rects;
  };
}
