import { distance } from "@/shared/lib/distance";
import type { Point } from "@/shared/types";
import { closestPointOnSegment } from "./closestPointOnSegment";

/** 선분을 찾을 선: 벽(`Wall`) 또는 구역 선(`RoomLine`, 열림). */
export type SegmentLine = { id: string; points: Point[]; closed?: boolean };

/** 찾은 선분. lineId는 벽 또는 구역 선의 id, segment는 그 선 안 선분 번호다. */
export type SegmentHit = { lineId: string; segment: number; from: Point; to: Point };

/** 점(cm)에서 hitRadius(cm) 안에 있는 가장 가까운 선분. 닫힌 벽은 마지막 → 첫 점 선분도 본다. 없으면 null. */
export function findSegment(
  walls: readonly SegmentLine[],
  point: Point,
  hitRadius: number,
): SegmentHit | null {
  let best: (SegmentHit & { distance: number }) | null = null;
  for (const wall of walls) {
    const count = wall.closed ? wall.points.length : wall.points.length - 1;
    for (let segment = 0; segment < count; segment++) {
      const from = wall.points[segment];
      const to = wall.points[(segment + 1) % wall.points.length];
      if (!from || !to) continue;
      const gap = distance(point, closestPointOnSegment(point, from, to));
      if (gap <= hitRadius && (!best || gap < best.distance)) {
        best = { lineId: wall.id, segment, from, to, distance: gap };
      }
    }
  }
  return best && { lineId: best.lineId, segment: best.segment, from: best.from, to: best.to };
}
