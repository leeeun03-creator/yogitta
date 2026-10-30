import type { Point } from "@/shared/types";
import type { Footprint } from "./boxFootprint";

/** 가운데(cm)와 차지하는 크기로 정한 사각형의 네 꼭짓점 (왼쪽 위부터 시계 방향). */
export function rectCorners(center: Point, size: Footprint): Point[] {
  const left = center.x - size.w / 2;
  const right = center.x + size.w / 2;
  const top = center.y - size.d / 2;
  const bottom = center.y + size.d / 2;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}
