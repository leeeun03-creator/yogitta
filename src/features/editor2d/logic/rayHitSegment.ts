import type { Point } from "@/shared/types";

/**
 * origin에서 direction 쪽으로 쏜 반직선이 선분 a-b와 만나는 거리(direction 길이 배수). 안 만나거나 평행하면 null.
 * 만나는 자리가 origin 바로(0)여도 돌려준다.
 */
export function rayHitSegment(origin: Point, direction: Point, a: Point, b: Point): number | null {
  const edge = { x: b.x - a.x, y: b.y - a.y };
  const cross = direction.x * edge.y - direction.y * edge.x;
  if (cross === 0) return null;
  const toA = { x: a.x - origin.x, y: a.y - origin.y };
  const along = (toA.x * edge.y - toA.y * edge.x) / cross; // 반직선 위 거리
  const onEdge = (toA.x * direction.y - toA.y * direction.x) / cross; // 선분 위 비율 (0~1)
  if (along < 0 || onEdge < 0 || onEdge > 1) return null;
  return along;
}
