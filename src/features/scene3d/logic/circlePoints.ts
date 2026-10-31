import { CIRCLE_SEGMENTS } from "@/shared/constants/scene";
import type { Xyz } from "./furniturePart";

/** 바닥과 나란한(높이 y) 반지름 radius 원의 점들. 처음 점을 끝에 한 번 더 넣어 닫는다. */
export function circlePoints(radius: number, y: number, segments = CIRCLE_SEGMENTS): Xyz[] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  });
}
