import type { Point, Wall } from "@/shared/types";

export type SegmentHit = { wallId: string; segment: number; from: Point; to: Point };

/** 점에서 선분(a-b)까지 가장 짧은 거리. */
function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

/** 점(cm)에서 hitRadius(cm) 안에 있는 가장 가까운 벽 선분. 닫힌 벽은 마지막 → 첫 점 선분도 본다. 없으면 null. */
export function findSegment(
  walls: readonly Wall[],
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
      const distance = distanceToSegment(point, from, to);
      if (distance <= hitRadius && (!best || distance < best.distance)) {
        best = { wallId: wall.id, segment, from, to, distance };
      }
    }
  }
  return best && { wallId: best.wallId, segment: best.segment, from: best.from, to: best.to };
}
