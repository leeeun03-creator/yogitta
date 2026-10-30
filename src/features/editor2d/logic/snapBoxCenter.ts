import type { Footprint } from "@/shared/lib/boxFootprint";
import { roundTo } from "@/shared/lib/roundTo";
import type { Point } from "@/shared/types";

/** 가구 가운데(cm)를 왼쪽 위 모서리가 격자에 붙는 자리로 옮긴다. 가구 크기가 격자에 맞으면 네 가장자리가 모두 격자선에 온다. */
export function snapBoxCenter(center: Point, size: Footprint, gridStep: number): Point {
  const corner = {
    x: roundTo(center.x - size.w / 2, gridStep),
    y: roundTo(center.y - size.d / 2, gridStep),
  };
  return { x: corner.x + size.w / 2, y: corner.y + size.d / 2 };
}
