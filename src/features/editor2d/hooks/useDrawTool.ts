import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Floor, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { nextLineDraft } from "../logic/nextLineDraft";
import { toFloorPoint } from "../logic/toFloorPoint";

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
  const isDrawing = tool === "line";

  const tap = (screen: Point) => {
    if (!isDrawing) return;
    const step = nextLineDraft(points, toFloorPoint(screen, box, floor));
    setPoints(step.draft);
    if (step.wall) addWall({ tool: "line", points: step.wall, closed: false });
  };

  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!isDrawing) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      setCursor(toFloorPoint(screen, box, floor));
    },
    onPointerLeave: () => setCursor(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && points.length > 0) setPoints([]);
    },
  };

  return { points, cursor: isDrawing ? cursor : null, tap, handlers };
}
