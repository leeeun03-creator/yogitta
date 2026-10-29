import {
  ROOM_LINE_AIM_CM,
  ROOM_LINE_ATTACH_CM,
  ROOM_LINE_LOOP_MIN_CM,
  ROOM_LINE_TOUCH_CM,
} from "@/shared/constants/room";
import { distance } from "@/shared/lib/distance";
import type { Floor, Point } from "@/shared/types";
import { findSegment, type SegmentLine } from "./findSegment";
import { floorEdges } from "./floorEdges";
import { rayHitSegment } from "./rayHitSegment";

/** 끝(ordered[0])에서 그어 오던 방향: 끝에서 20cm 안쪽 점(없으면 반대쪽 끝) → 끝. */
function aimOf(ordered: readonly Point[]): Point | null {
  const [end] = ordered;
  if (!end) return null;
  const back = ordered.find((point) => distance(point, end) >= ROOM_LINE_AIM_CM);
  const from = back ?? ordered[ordered.length - 1];
  if (!from || distance(from, end) === 0) return null;
  return { x: end.x - from.x, y: end.y - from.y };
}

/** 끝에서 그어 오던 방향으로 늘려 처음 만나는 경계 위 점. 바닥 테두리가 있어 보통 늘 찾는다. */
function extendEnd(ordered: readonly Point[], targets: readonly SegmentLine[]): Point | null {
  const [end] = ordered;
  const aim = aimOf(ordered);
  if (!end || !aim) return null;
  let nearest: number | null = null;
  for (const line of targets) {
    const count = line.closed ? line.points.length : line.points.length - 1;
    for (let index = 0; index < count; index++) {
      const a = line.points[index];
      const b = line.points[(index + 1) % line.points.length];
      const hit = a && b ? rayHitSegment(end, aim, a, b) : null;
      if (hit !== null && hit > 0 && (nearest === null || hit < nearest)) nearest = hit;
    }
  }
  return nearest === null ? null : { x: end.x + aim.x * nearest, y: end.y + aim.y * nearest };
}

/** 두 끝이 서로 가깝고 선이 멀리 갔다 왔으면 고리다. */
function isLoop(points: readonly Point[]): boolean {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || distance(first, last) > ROOM_LINE_ATTACH_CM) return false;
  return points.some((point) => distance(point, first) > ROOM_LINE_LOOP_MIN_CM);
}

/**
 * 벽·다른 구역 선·바닥 테두리에 닿지 않은 구역 선 끝을 그어 가던 방향으로 늘려, 처음 만나는 경계에 닿게 한다.
 * 끝이 떠 있으면 바닥이 나뉘지 않아서다. 두 끝이 모두 떠 있는 고리는 늘리지 않고 닫아 안쪽을 구획으로 만든다.
 */
export function extendRoomLineEnds(
  points: readonly Point[],
  floor: Floor,
  lines: readonly SegmentLine[],
): Point[] {
  const targets = [...lines, floorEdges(floor)];
  const touches = (point: Point | undefined) =>
    !point || findSegment(targets, point, ROOM_LINE_TOUCH_CM) !== null;
  const first = points[0];
  const last = points[points.length - 1];
  if (!touches(first) && !touches(last) && isLoop(points) && first) return [...points, first];
  const head = touches(first) ? null : extendEnd(points, targets);
  const tail = touches(last) ? null : extendEnd([...points].reverse(), targets);
  return [...(head ? [head] : []), ...points, ...(tail ? [tail] : [])];
}
