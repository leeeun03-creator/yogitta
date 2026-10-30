import { BOX_MIN_SIZE_CM } from "@/shared/constants/furniture";
import type { Point } from "@/shared/types";

/** 끈 두 점(cm)으로 정한 새 가구의 가운데와 가로·깊이 (cm). */
export type BoxPlacement = { center: Point; w: number; d: number };

/** 한 방향의 길이와 가운데. 최소 크기보다 짧으면 누른 점에서 끈 쪽으로 최소 크기만큼 늘린다. */
function span(from: number, to: number) {
  const size = Math.max(Math.abs(to - from), BOX_MIN_SIZE_CM);
  const direction = to < from ? -1 : 1;
  return { middle: from + (direction * size) / 2, size };
}

/** 가구 도구로 끈 사각형. 가로·세로가 최소 크기(10cm)보다 짧으면 최소 크기로 만든다 (누른 점은 그대로 한 모서리). */
export function boxFromDrag(start: Point, end: Point): BoxPlacement {
  const x = span(start.x, end.x);
  const y = span(start.y, end.y);
  return { center: { x: x.middle, y: y.middle }, w: x.size, d: y.size };
}
