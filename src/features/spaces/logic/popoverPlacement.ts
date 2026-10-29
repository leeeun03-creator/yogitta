import {
  ROOM_POPOVER_GAP_PX,
  ROOM_POPOVER_HEIGHT_PX,
  ROOM_POPOVER_MARGIN_PX,
  ROOM_POPOVER_WIDTH_PX,
} from "@/shared/constants/room";
import { clamp } from "@/shared/lib/clamp";
import type { Point } from "@/shared/types";

/**
 * 새 구역 이름 입력칸의 왼쪽 위 자리(px). 누른 자리 바로 아래 가운데에 두고, 아래가 모자라면 위에 둔다.
 * 2D 평면도 영역(viewport) 밖으로 나가지 않게 당긴다.
 */
export function popoverPlacement(point: Point, viewport: { width: number; height: number }): Point {
  const below = point.y + ROOM_POPOVER_GAP_PX;
  const fitsBelow = below + ROOM_POPOVER_HEIGHT_PX <= viewport.height - ROOM_POPOVER_MARGIN_PX;
  const top = fitsBelow ? below : point.y - ROOM_POPOVER_GAP_PX - ROOM_POPOVER_HEIGHT_PX;
  const left = point.x - ROOM_POPOVER_WIDTH_PX / 2;
  return {
    x: clamp(
      left,
      ROOM_POPOVER_MARGIN_PX,
      viewport.width - ROOM_POPOVER_MARGIN_PX - ROOM_POPOVER_WIDTH_PX,
    ),
    y: clamp(
      top,
      ROOM_POPOVER_MARGIN_PX,
      viewport.height - ROOM_POPOVER_MARGIN_PX - ROOM_POPOVER_HEIGHT_PX,
    ),
  };
}
