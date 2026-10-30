import type { RefObject } from "react";
import { callAll } from "@/shared/lib/callAll";
import { formatSize } from "@/shared/lib/formatSize";
import type { Space } from "@/shared/types";
import type { BoxPlacement } from "../logic/boxFromDrag";
import type { Measure } from "../logic/draftMeasure";
import { useAppStore } from "@/store/useAppStore";
import { mergeHandlers } from "./mergeHandlers";
import { useBoxTool } from "./useBoxTool";
import { useEraserTool } from "./useEraserTool";
import { useLoupe } from "./useLoupe";
import { usePartHover } from "./usePartHover";
import { usePanZoom } from "./usePanZoom";
import { usePlanRooms } from "./usePlanRooms";
import { useRoomLineTool } from "./useRoomLineTool";
import { useRoomTap } from "./useRoomTap";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";
import { useWallTools } from "./useWallTools";

/** 끄는 중인 가구 가운데에 크기("60 × 50 cm"). 가구 크기는 속성 패널과 같은 cm로 보인다. */
const boxMeasure = (draft: BoxPlacement | null): Measure | null =>
  draft && { text: formatSize(draft.w, draft.d), at: draft.center };

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 벽 도구, 구역 선, 가구, 지우개, 구획 누르기·올리기, 터치 돋보기)을 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(ref: RefObject<HTMLElement | null>, space: Space) {
  const tool = useAppStore((state) => state.ui.tool);
  const { box, handlers: pan } = usePanZoom(ref, space.floor, tool === "select");
  const rooms = usePlanRooms(space);
  const snapAt = useSnapper(space.walls, box, space.floor);
  const wall = useWallTools(tool, box, snapAt);
  const roomLine = useRoomLineTool(tool, box, space.floor, rooms.lines);
  const boxTool = useBoxTool(tool, box, space.floor, snapAt);
  const eraser = useEraserTool(tool, box, space.walls, rooms.roomLines);
  const roomTap = useRoomTap(tool, box, space, rooms.lines);
  const tap = useTap(callAll(wall.tap, eraser.tap, roomTap));
  const loupe = useLoupe(tool);
  const hover = usePartHover(tool, box, rooms.findUnnamed);

  return {
    tool,
    box,
    scene: {
      ...wall.scene,
      erasing: eraser.erasing,
      roomLines: rooms.roomLines,
      roomLineDraft: roomLine.draft,
      roomAreas: rooms.areas,
      selectedRoom: rooms.selected,
      partPreview: hover.rects && { rects: hover.rects, color: rooms.nextColor },
      boxes: space.boxes,
      boxDraft: boxTool.draft,
      measure: wall.scene.measure ?? boxMeasure(boxTool.draft),
    },
    finger: loupe.finger, // 돋보기를 띄울 손가락 자리
    // 같은 이벤트는 줌·이동 → 돋보기 → 누르기 → 그리기 도구 → 가구 → 지우개 → 구획 올리기 순서로 받는다
    handlers: mergeHandlers(
      pan,
      loupe.handlers,
      tap,
      wall.handlers,
      roomLine.handlers,
      boxTool.handlers,
      eraser.handlers,
      hover.handlers,
    ),
  };
}
