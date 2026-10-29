import type { Floor, Point } from "@/shared/types";
import { closestPointOnSegment } from "./closestPointOnSegment";
import { findSegment, type SegmentLine } from "./findSegment";
import { floorEdges } from "./floorEdges";

/** point에서 radius(cm) 안에 있는 선 위의 가장 가까운 점. 없으면 null. */
function nearestOnLines(point: Point, lines: readonly SegmentLine[], radius: number) {
  const hit = findSegment(lines, point, radius);
  return hit && closestPointOnSegment(point, hit.from, hit.to);
}

/**
 * 구역 선 두 끝을 radius(cm) 안의 가장 가까운 벽·다른 구역 선·바닥 테두리 위로 옮긴다.
 * 손으로 그어도 끝이 경계에 딱 닿아 구획이 나뉘게 한다. 가운데 점은 그대로다.
 */
export function attachRoomLineEnds(
  points: readonly Point[],
  floor: Floor,
  lines: readonly SegmentLine[],
  radius: number,
): Point[] {
  const targets = [...lines, floorEdges(floor)];
  return points.map((point, index) => {
    const isEnd = index === 0 || index === points.length - 1;
    return (isEnd && nearestOnLines(point, targets, radius)) || point;
  });
}
