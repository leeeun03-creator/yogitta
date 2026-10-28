import type { RefObject } from "react";
import { DIMENSION_FONT_PX, LENGTH_LABEL_GAP_PX } from "@/shared/constants/floorPlan";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import { callAll } from "@/shared/lib/callAll";
import type { Floor, Wall } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { draftMeasure, type DraftMeasureInput } from "../logic/draftMeasure";
import { useDrawTool } from "./useDrawTool";
import { useEraserTool } from "./useEraserTool";
import { useLoupe } from "./useLoupe";
import { usePanZoom } from "./usePanZoom";
import { useRectTool } from "./useRectTool";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";

/** 길이 표시는 화면 px 기준 크기로 둔다 (선 가운데에서 글자까지 = 벽 두께 절반 + 간격). */
const measureOf = (input: Omit<DraftMeasureInput, "gap" | "fontSize">) =>
  draftMeasure({
    ...input,
    gap: WALL_THICKNESS_CM / 2 + LENGTH_LABEL_GAP_PX * input.box.cmPerPx,
    fontSize: DIMENSION_FONT_PX * input.box.cmPerPx,
  });

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 직선·연속선 누르기·끌기, 사각형 끌기, 지우개, 터치 돋보기)을 엮어 처리기 하나씩으로 묶는다. */
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
  const loupe = useLoupe(tool);
  const draft = tool === "rect" ? rect.preview : draw.points;
  // 그리던 점에 커서를 이어 그리는 미리보기는 직선·연속선만 (사각형은 끄는 모양이 미리보기)
  const previewCursor = tool === "rect" ? null : (draw.cursor?.point ?? null);

  return {
    tool,
    box,
    scene: {
      draft,
      previewCursor,
      cursor: draw.cursor, // 붙을 곳 표시
      measure: measureOf({ tool, draft, cursor: previewCursor, box }),
      erasing: eraser.hover,
    },
    finger: loupe.finger, // 돋보기를 띄울 손가락 자리
    handlers: {
      onPointerDown: callAll(
        pan.onPointerDown,
        loupe.handlers.onPointerDown,
        tap.onPointerDown,
        draw.handlers.onPointerDown,
        shape.onPointerDown,
      ),
      onPointerMove: callAll(
        pan.onPointerMove,
        loupe.handlers.onPointerMove,
        tap.onPointerMove,
        draw.handlers.onPointerMove,
        shape.onPointerMove,
        eraser.handlers.onPointerMove,
      ),
      onPointerUp: callAll(
        pan.onPointerUp,
        loupe.handlers.onPointerUp,
        tap.onPointerUp,
        draw.handlers.onPointerUp,
        shape.onPointerUp,
      ),
      onPointerCancel: callAll(
        pan.onPointerCancel,
        loupe.handlers.onPointerCancel,
        tap.onPointerCancel,
        draw.handlers.onPointerCancel,
        shape.onPointerCancel,
      ),
      onPointerLeave: callAll(draw.handlers.onPointerLeave, eraser.handlers.onPointerLeave),
      onKeyDown: callAll(pan.onKeyDown, draw.handlers.onKeyDown, shape.onKeyDown),
    },
  };
}
