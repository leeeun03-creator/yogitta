import type { Floor, Point } from "@/shared/types";
import type { ViewBox } from "./fitViewBox";
import { screenToCm } from "./screenToCm";

/** 2D 평면도 안의 화면 좌표(px)를 바닥 점(cm, 1cm 단위)으로 바꾼다. 바닥 밖이면 가장 가까운 경계로 붙인다. */
export function toFloorPoint(screen: Point, box: ViewBox, floor: Floor): Point {
  const cm = screenToCm(screen, box);
  return {
    x: Math.min(Math.max(Math.round(cm.x), 0), floor.w),
    y: Math.min(Math.max(Math.round(cm.y), 0), floor.h),
  };
}
