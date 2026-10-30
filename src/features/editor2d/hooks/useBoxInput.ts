import type { KeyboardEvent } from "react";
import { formatSize } from "@/shared/lib/formatSize";
import type { Box, Point, Space } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import type { BoxPlacement } from "../logic/boxFromDrag";
import type { Measure } from "../logic/draftMeasure";
import { findBoxAt } from "../logic/findBoxAt";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { mergeHandlers } from "./mergeHandlers";
import { useBoxDrag } from "./useBoxDrag";
import { useBoxTool } from "./useBoxTool";
import type { SnapAt } from "./useSnapper";

/** 끄는 중인 가구 가운데에 크기("60 × 50 cm"). 가구 크기는 속성 패널과 같은 cm로 보인다. */
const draftMeasure = (draft: BoxPlacement | null): Measure | null =>
  draft && { text: formatSize(draft.w, draft.d), at: draft.center };

/** 끄는 중인 가구는 옮길 자리에 그린다 (떼기 전에는 데이터를 바꾸지 않는다). */
const withMoving = (boxes: Box[], moving: { id: string; center: Point } | null) =>
  moving
    ? boxes.map((box) =>
        box.id === moving.id ? { ...box, x: moving.center.x, z: moving.center.y } : box,
      )
    : boxes;

/**
 * 가구 입력: 가구 도구로 놓기, 선택 도구로 누르면 고르기(빈 곳은 풀기)·끌어 옮기기, Esc로 풀기.
 * tap은 가구를 눌러 골랐으면 true를 돌려준다 (그 아래 구획을 눌러 구역 입력칸이 뜨지 않게).
 */
export function useBoxInput(tool: DrawingTool, view: ViewBox, space: Space, snapAt: SnapAt) {
  const selected = useAppStore((state) => state.ui.selectedBoxId);
  const selectBox = useAppStore((state) => state.selectBox);
  const place = useBoxTool(tool, view, space.floor, snapAt);
  const drag = useBoxDrag(tool, view, space);

  const tap = (screen: Point) => {
    if (tool !== "select") return false;
    const hit = findBoxAt(space.boxes, screenToCm(screen, view));
    selectBox(hit?.id ?? null);
    return hit !== null;
  };
  const deselect = {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && selected !== null) selectBox(null);
    },
  };

  return {
    tap,
    scene: {
      boxes: withMoving(space.boxes, drag.moving),
      boxDraft: place.draft,
      selectedBox: drag.moving?.id ?? selected,
    },
    measure: draftMeasure(place.draft),
    handlers: mergeHandlers(place.handlers, drag.handlers, deselect),
  };
}
