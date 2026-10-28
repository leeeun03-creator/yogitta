import type { Floor, Point } from "@/shared/types";

/** 보는 중심(cm)을 바닥 안으로 묶는다. 중심이 바닥 안에 있으면 바닥 일부는 항상 화면에 보인다. */
export function clampCenter(center: Point, floor: Floor): Point {
  return {
    x: Math.min(Math.max(center.x, 0), floor.w),
    y: Math.min(Math.max(center.y, 0), floor.h),
  };
}
