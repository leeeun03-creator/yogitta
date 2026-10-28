import { useState, type PointerEvent } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { Point, Wall } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { findSegment, type SegmentHit } from "../logic/findSegment";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";

/** 지우개 도구: 올리면 지울 선분을 표시하고, 누르면 그 선분만 지운다. 벽 두께 절반 + 화면 8px 안이면 맞은 것으로 본다. */
export function useEraserTool(tool: DrawingTool, box: ViewBox, walls: readonly Wall[]) {
  const eraseSegment = useAppStore((state) => state.eraseSegment);
  const [hover, setHover] = useState<SegmentHit | null>(null);
  const isActive = tool === "eraser";
  // 바닥 경계로 붙이지 않은 좌표로 판정한다 (가장자리 근처에서 위치가 틀어지지 않게)
  const hitAt = (screen: Point) =>
    findSegment(walls, screenToCm(screen, box), WALL_THICKNESS_CM / 2 + POINT_HIT_PX * box.cmPerPx);

  const tap = (screen: Point) => {
    if (!isActive) return;
    const hit = hitAt(screen);
    if (hit) eraseSegment(hit.wallId, hit.segment);
    setHover(null);
  };

  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isActive) setHover(hitAt(eventPoint(event)));
    },
    onPointerLeave: () => setHover(null),
  };

  return { hover: isActive ? hover : null, tap, handlers };
}
