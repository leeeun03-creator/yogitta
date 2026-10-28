import type { RefObject } from "react";
import { callAll } from "@/shared/lib/callAll";
import type { Floor } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { useDrawTool } from "./useDrawTool";
import { usePanZoom } from "./usePanZoom";
import { useRectTool } from "./useRectTool";
import { useTap } from "./useTap";

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 직선·연속선, 사각형 끌기)을 엮어 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(ref: RefObject<HTMLElement | null>, floor: Floor) {
  const tool = useAppStore((state) => state.ui.tool);
  const { box, handlers: pan } = usePanZoom(ref, floor, tool === "select");
  const draw = useDrawTool(tool, box, floor);
  const rect = useRectTool(tool, box, floor);
  const tap = useTap(draw.tap);
  const shape = rect.handlers;

  return {
    tool,
    box,
    draft: tool === "rect" ? rect.preview : draw.points,
    cursor: draw.cursor,
    handlers: {
      onPointerDown: callAll(pan.onPointerDown, tap.onPointerDown, shape.onPointerDown),
      onPointerMove: callAll(pan.onPointerMove, draw.handlers.onPointerMove, shape.onPointerMove),
      onPointerUp: callAll(pan.onPointerUp, tap.onPointerUp, shape.onPointerUp),
      onPointerCancel: callAll(pan.onPointerCancel, tap.onPointerCancel, shape.onPointerCancel),
      onPointerLeave: draw.handlers.onPointerLeave,
      onKeyDown: callAll(pan.onKeyDown, draw.handlers.onKeyDown, shape.onKeyDown),
    },
  };
}
