import { boxFootprint } from "@/shared/lib/boxFootprint";
import type { Box } from "@/shared/types";
import type { ViewBox } from "./fitViewBox";

/** 화면 사각형 (px, 2D 평면도 영역 왼쪽 위 기준). */
export type ScreenRect = { left: number; top: number; width: number; height: number };

/** 가구가 차지하는 바닥 사각형을 지금 2D 평면도 화면 위치(px)로 바꾼다. 줌·이동하면 따라간다. */
export function boxScreenRect(box: Box, view: ViewBox): ScreenRect {
  const size = boxFootprint(box);
  return {
    left: (box.x - size.w / 2 - view.x) / view.cmPerPx,
    top: (box.z - size.d / 2 - view.y) / view.cmPerPx,
    width: size.w / view.cmPerPx,
    height: size.d / view.cmPerPx,
  };
}
