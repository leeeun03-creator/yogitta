import type { Point } from "@/shared/types";
import type { ViewBox } from "./fitViewBox";

/** 2D 평면도 안의 화면 좌표(px, 영역 왼쪽 위 기준)를 바닥 좌표(cm)로 바꾼다. */
export function screenToCm(screen: Point, box: ViewBox): Point {
  return { x: box.x + screen.x * box.cmPerPx, y: box.y + screen.y * box.cmPerPx };
}
