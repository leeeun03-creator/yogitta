import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import { callAll } from "@/shared/lib/callAll";
import type { Box, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { drawDragStep } from "../logic/drawDragStep";
import { drawKeyStep } from "../logic/drawKeyStep";
import { drawTapStep, type DrawStep } from "../logic/drawTapStep";
import type { ViewBox } from "../logic/fitViewBox";
import { isDrawStepBlocked } from "../logic/isDrawStepBlocked";
import { eventPoint } from "./eventPoint";
import { useDrawDrag } from "./useDrawDrag";
import type { SnapAt, Snapped } from "./useSnapper";

/** 그리던 점. 도구가 바뀐 순간 버린다 (다시 같은 도구로 돌아와도 되살아나지 않게). */
function useToolDraft(tool: DrawingTool) {
  const [points, setPoints] = useState<Point[]>([]);
  const [drawingTool, setDrawingTool] = useState(tool);
  if (drawingTool !== tool) {
    setDrawingTool(tool);
    setPoints([]);
  }
  return [points, setPoints] as const;
}

/** 키를 누르면 drawKeyStep대로 그리던 점을 바꾼다(Enter로 끝내기, Esc로 버리기 등). Esc는 끌던 것도 버린다. */
function keyHandler(
  tool: DrawingTool,
  points: Point[],
  cancelDrag: () => void,
  apply: (step: DrawStep) => void,
) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") cancelDrag();
    const step = drawKeyStep(tool, points, event.key);
    if (!step) return;
    event.preventDefault();
    apply(step);
  };
}

/** 벽 도구가 받는 것: 붙일 곳 찾기, 벽이 파고들면 안 되는 가구, 막혔을 때 알리기. */
export type WallInput = { snapAt: SnapAt; boxes: readonly Box[]; onBlocked: () => void };

const TAP_TOOLS: readonly DrawingTool[] = ["line", "polyline"];
const CURSOR_TOOLS: readonly DrawingTool[] = [...TAP_TOOLS, "rect"];

/**
 * 직선·연속선 도구로 찍은 점(draft)과 붙을 커서 위치를 들고, 다 그리면 store에 벽을 더한다.
 * 두 번 누르기와 끌어서 그리기 모두 된다. 도구를 바꾸면 그리던 것은 버린다.
 * 가구를 지나가게 되는 점은 찍지 않고 알린다(onBlocked).
 */
export function useDrawTool(tool: DrawingTool, box: ViewBox, input: WallInput) {
  const { snapAt, boxes, onBlocked } = input;
  const addWall = useAppStore((state) => state.addWall);
  const [points, setPoints] = useToolDraft(tool);
  const [cursor, setCursor] = useState<Snapped | null>(null);

  const closeRadius = POINT_HIT_PX * box.cmPerPx;
  const apply = (step: DrawStep) => {
    if (isDrawStepBlocked(points, step, boxes)) {
      onBlocked();
      return;
    }
    setPoints(step.draft);
    if (step.wall) addWall(step.wall);
  };
  const drag = useDrawDrag(
    TAP_TOOLS.includes(tool),
    (screen) => snapAt(screen, points).point,
    (start, endScreen) => {
      const end = snapAt(endScreen, points.length > 0 ? points : [start]).point;
      apply(drawDragStep(tool, points, start, end, closeRadius));
    },
  );
  // 빈 상태에서 끄는 동안에는 누른 점부터 미리보기 선을 그린다
  const shown = points.length === 0 && drag.start ? [drag.start] : points;
  const tap = (screen: Point) => {
    if (TAP_TOOLS.includes(tool))
      apply(drawTapStep(tool, points, snapAt(screen, points).point, closeRadius));
  };
  const handlers = {
    ...drag.handlers,
    onPointerMove: callAll(drag.handlers.onPointerMove, (event: PointerEvent<HTMLElement>) => {
      if (CURSOR_TOOLS.includes(tool)) setCursor(snapAt(eventPoint(event), shown));
    }),
    onPointerLeave: () => setCursor(null),
    onKeyDown: keyHandler(tool, points, drag.cancel, apply),
  };

  return { points: shown, cursor: CURSOR_TOOLS.includes(tool) ? cursor : null, tap, handlers };
}
