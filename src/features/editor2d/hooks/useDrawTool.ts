import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import type { Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { drawKeyStep } from "../logic/drawKeyStep";
import { drawTapStep, type DrawStep } from "../logic/drawTapStep";
import type { ViewBox } from "../logic/fitViewBox";
import { eventPoint } from "./eventPoint";
import type { SnapAt, Snapped } from "./useSnapper";

const TAP_TOOLS: readonly DrawingTool[] = ["line", "polyline"];
const CURSOR_TOOLS: readonly DrawingTool[] = [...TAP_TOOLS, "rect"];

/** 그리기 도구로 찍은 점(draft)과 붙을 커서 위치를 들고, 다 그리면 store에 벽을 더한다. 도구를 바꾸면 그리던 것은 버린다. */
export function useDrawTool(tool: DrawingTool, box: ViewBox, snapAt: SnapAt) {
  const addWall = useAppStore((state) => state.addWall);
  const [points, setPoints] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Snapped | null>(null);
  // 도구가 바뀐 순간 그리던 점을 버린다 (다시 같은 도구로 돌아와도 되살아나지 않게)
  const [drawingTool, setDrawingTool] = useState(tool);
  if (drawingTool !== tool) {
    setDrawingTool(tool);
    setPoints([]);
  }

  const apply = (step: DrawStep) => {
    setPoints(step.draft);
    if (step.wall) addWall(step.wall);
  };
  const tap = (screen: Point) => {
    if (!TAP_TOOLS.includes(tool)) return;
    const { point } = snapAt(screen, points);
    apply(drawTapStep(tool, points, point, POINT_HIT_PX * box.cmPerPx));
  };

  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (CURSOR_TOOLS.includes(tool)) setCursor(snapAt(eventPoint(event), points));
    },
    onPointerLeave: () => setCursor(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const step = drawKeyStep(tool, points, event.key);
      if (!step) return;
      event.preventDefault();
      apply(step);
    },
  };

  return { points, cursor: CURSOR_TOOLS.includes(tool) ? cursor : null, tap, handlers };
}
