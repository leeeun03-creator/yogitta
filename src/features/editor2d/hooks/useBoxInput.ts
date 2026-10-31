import { useMemo } from "react";
import { formatSize } from "@/shared/lib/formatSize";
import { overlappingBoxes } from "@/shared/lib/overlappingBoxes";
import { stackedElevation } from "@/shared/lib/stackedElevation";
import type { Box, Space } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import type { Measure } from "../logic/draftMeasure";
import type { BoxMove } from "../logic/nextBoxMove";
import { stackOrder } from "../logic/stackOrder";
import type { ViewBox } from "../logic/fitViewBox";
import { mergeHandlers } from "./mergeHandlers";
import { useBoxDrag } from "./useBoxDrag";
import { useBoxSelect } from "./useBoxSelect";
import { useBoxTool, type BoxDraft } from "./useBoxTool";
import type { SnapAt } from "./useSnapper";

/** 끄는 중인 가구 가운데에 크기("60 × 50 cm"). 가구 크기는 속성 패널과 같은 cm로 보인다. */
const draftMeasure = (draft: BoxDraft | null): Measure | null =>
  draft && { text: formatSize(draft.w, draft.d), at: draft.center };

/**
 * 끄는 중인 가구는 옮길 자리·높이에 그린다 (떼기 전에는 데이터를 바꾸지 않는다). 다른 가구 위로 끌면
 * 그 높이에 그려 받침 가구 위에 보인다. 2D는 낮은 가구부터 그린다.
 */
function withMoving(boxes: readonly Box[], moving: (BoxMove & { id: string }) | null) {
  const base = boxes.find((box) => box.id === moving?.parentId) ?? null;
  const drawn = boxes.map((box) => {
    if (box.id !== moving?.id) return box;
    const { x, y } = moving.center;
    return { ...box, x, z: y, elevation: stackedElevation(box, base) }; // 2D y = 3D z
  });
  return stackOrder(drawn);
}

/**
 * 가구 입력: 가구 도구로 놓기(겹치는 자리면 안내), 선택 도구로 누르기(고르기·풀기·회전 핸들)·끌어 옮기기,
 * 고른 가구 키보드(R·Delete·Esc), 벽·다른 가구와 겹쳐 있는 가구 찾기.
 * tap은 가구나 회전 핸들을 눌렀으면 true를 돌려준다 (그 아래 구획을 눌러 구역 입력칸이 뜨지 않게).
 */
export function useBoxInput(
  tool: DrawingTool,
  view: ViewBox,
  space: Space,
  input: { snapAt: SnapAt; notify: (message: string) => void },
) {
  const selected = useAppStore((state) => state.ui.selectedBoxId);
  const place = useBoxTool(tool, view, space, input);
  const drag = useBoxDrag(tool, view, space);
  const choose = useBoxSelect(tool, view, space.boxes);
  const { walls, boxes } = space;
  const overlapping = useMemo(() => overlappingBoxes({ walls, boxes }), [walls, boxes]);

  return {
    tap: choose.tap,
    scene: {
      boxes: withMoving(space.boxes, drag.moving),
      boxDraft: place.draft,
      selectedBox: drag.moving?.id ?? selected,
      overlapping,
    },
    measure: draftMeasure(place.draft),
    handlers: mergeHandlers(place.handlers, drag.handlers, choose.handlers),
  };
}
