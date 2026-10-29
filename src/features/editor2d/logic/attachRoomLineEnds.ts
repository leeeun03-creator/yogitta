import { distance } from "@/shared/lib/distance";
import type { Floor, Point } from "@/shared/types";
import { closestPointOnSegment } from "./closestPointOnSegment";
import type { SegmentLine } from "./findSegment";
import { floorEdges } from "./floorEdges";

/** point에서 radius(cm) 안에 있는 선 위의 가장 가까운 점. 없으면 null. */
function nearestOnLines(point: Point, lines: readonly SegmentLine[], radius: number) {
  let best: { point: Point; gap: number } | null = null;
  for (const line of lines) {
    const count = line.closed ? line.points.length : line.points.length - 1;
    for (let index = 0; index < count; index++) {
      const a = line.points[index];
      const b = line.points[(index + 1) % line.points.length];
      if (!a || !b) continue;
      const candidate = closestPointOnSegment(point, a, b);
      const gap = distance(point, candidate);
      if (gap <= radius && (!best || gap < best.gap)) best = { point: candidate, gap };
    }
  }
  return best?.point ?? null;
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
