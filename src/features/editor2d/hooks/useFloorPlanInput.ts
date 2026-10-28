import type { RefObject } from "react";
import { callAll } from "@/shared/lib/callAll";
import type { Floor, Wall } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { useDrawTool } from "./useDrawTool";
import { useEraserTool } from "./useEraserTool";
import { usePanZoom } from "./usePanZoom";
import { useRectTool } from "./useRectTool";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 직선·연속선, 사각형 끌기, 지우개)을 엮어 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(
  ref: RefObject<HTMLElement | null>,
  floor: Floor,
  walls: readonly Wall[],
) {
  const tool = useAppStore((state) => state.ui.tool);
  const { box, handlers: pan } = usePanZoom(ref, floor, tool === "select");
  const snapAt = useSnapper(walls, box, floor);
  const draw = useDrawTool(tool, box, snapAt);
  const rect = useRectTool(tool, snapAt);
  const eraser = useEraserTool(tool, box, walls);
  const tap = useTap(callAll(draw.tap, eraser.tap));
  const shape = rect.handlers;

  return {
    tool,
    box,
    draft: tool === "rect" ? rect.preview : draw.points,
    cursor: draw.cursor, // 붙을 곳 표시
    // 그리던 점에 커서를 이어 그리는 미리보기는 직선·연속선만 (사각형은 끄는 모양이 미리보기)
    previewCursor: tool === "rect" ? null : (draw.cursor?.point ?? null),
    erasing: eraser.hover,
    handlers: {
      onPointerDown: callAll(pan.onPointerDown, tap.onPointerDown, shape.onPointerDown),
      onPointerMove: callAll(
        pan.onPointerMove,
        draw.handlers.onPointerMove,
        shape.onPointerMove,
        eraser.handlers.onPointerMove,
      ),
      onPointerUp: callAll(pan.onPointerUp, tap.onPointerUp, shape.onPointerUp),
      onPointerCancel: callAll(pan.onPointerCancel, tap.onPointerCancel, shape.onPointerCancel),
      onPointerLeave: callAll(draw.handlers.onPointerLeave, eraser.handlers.onPointerLeave),
      onKeyDown: callAll(pan.onKeyDown, draw.handlers.onKeyDown, shape.onKeyDown),
    },
  };
}
