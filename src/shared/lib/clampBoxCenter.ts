import type { Floor, Point } from "@/shared/types";
import type { Footprint } from "./boxFootprint";
import { clamp } from "./clamp";

/** 가구 가운데(cm)를 가구가 바닥 밖으로 나가지 않는 자리로 당긴다. 가구가 바닥보다 크면 그 방향은 바닥 가운데다. */
export function clampBoxCenter(center: Point, size: Footprint, floor: Floor): Point {
  return {
    x: clamp(center.x, size.w / 2, floor.w - size.w / 2),
    y: clamp(center.y, size.d / 2, floor.h - size.d / 2),
  };
}
