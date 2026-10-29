import { ROOM_LINE_MIN_CM, ROOM_LINE_POINT_GAP_CM } from "@/shared/constants/room";
import { clamp } from "@/shared/lib/clamp";
import { distance } from "@/shared/lib/distance";
import type { Floor, Point } from "@/shared/types";

const DECIMALS = 10; // 0.1cm까지만 남긴다 (저장 크기를 줄이려고)

const round = (value: number) => Math.round(value * DECIMALS) / DECIMALS;
const onFloor = (point: Point, floor: Floor): Point => ({
  x: round(clamp(point.x, 0, floor.w)),
  y: round(clamp(point.y, 0, floor.h)),
});

/** 선을 이루는 선분 길이의 합 (cm). */
function lengthOf(points: readonly Point[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1];
    const b = points[index];
    if (a && b) total += distance(a, b);
  }
  return total;
}

/**
 * 끌면서 찍힌 점들을 구역 선 점 목록으로 줄인다. 바닥 밖 점은 바닥 경계로 당기고, 앞 점에서 5cm보다 가까운 점은 버린다(끝점은 남긴다).
 * 20cm보다 짧으면 실수로 보고 null이다.
 */
export function simplifyRoomLine(raw: readonly Point[], floor: Floor): Point[] | null {
  const points = raw.map((point) => onFloor(point, floor));
  const kept: Point[] = [];
  for (const point of points) {
    const last = kept[kept.length - 1];
    if (!last || distance(last, point) >= ROOM_LINE_POINT_GAP_CM) kept.push(point);
  }
  // 손을 뗀 자리는 꼭 끝점이 된다 (바로 앞 점과 가까우면 그 점을 바꾼다)
  const end = points[points.length - 1];
  if (end && kept.length > 1 && kept[kept.length - 1] !== end) kept[kept.length - 1] = end;
  return kept.length >= 2 && lengthOf(kept) >= ROOM_LINE_MIN_CM ? kept : null;
}
