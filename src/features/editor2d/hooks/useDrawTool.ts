import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import type { Floor, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { drawKeyStep } from "../logic/drawKeyStep";
import { drawTapStep, type DrawStep } from "../logic/drawTapStep";
import type { ViewBox } from "../logic/fitViewBox";
import { toFloorPoint } from "../logic/toFloorPoint";
import { eventPoint } from "./eventPoint";

const TAP_TOOLS: readonly DrawingTool[] = ["line", "polyline"];

/** 그리기 도구로 찍은 점(draft)과 커서 위치를 들고, 다 그리면 store에 벽을 더한다. 도구를 바꾸면 그리던 것은 버린다. */
export function useDrawTool(tool: DrawingTool, box: ViewBox, floor: Floor) {
  const addWall = useAppStore((state) => state.addWall);
  const [points, setPoints] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Point | null>(null);
  // 도구가 바뀐 순간 그리던 점을 버린다 (다시 같은 도구로 돌아와도 되살아나지 않게)
  const [drawingTool, setDrawingTool] = useState(tool);
  if (drawingTool !== tool) {
    setDrawingTool(tool);
    setPoints([]);
  }
  const isDrawing = TAP_TOOLS.includes(tool);

  const apply = (step: DrawStep) => {
    setPoints(step.draft);
    if (step.wall) addWall(step.wall);
  };
  const tap = (screen: Point) => {
    const point = toFloorPoint(screen, box, floor);
    if (isDrawing) apply(drawTapStep(tool, points, point, POINT_HIT_PX * box.cmPerPx));
  };

  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!isDrawing) return;
      setCursor(toFloorPoint(eventPoint(event), box, floor));
    },
    onPointerLeave: () => setCursor(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const step = drawKeyStep(tool, points, event.key);
      if (!step) return;
      event.preventDefault();
      apply(step);
    },
  };

  return { points, cursor: isDrawing ? cursor : null, tap, handlers };
}
