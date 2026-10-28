import type { Point } from "@/shared/types";

/** 끈 두 점으로 닫힌 사각형의 점 4개(왼쪽 위부터 시계 방향)를 만든다. 가로나 세로가 0이면 null. */
export function rectFromDrag(start: Point, end: Point): Point[] | null {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const bottom = Math.max(start.y, end.y);
  if (left === right || top === bottom) return null;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}
