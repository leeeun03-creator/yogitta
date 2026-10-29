import type { RefObject } from "react";
import { callAll } from "@/shared/lib/callAll";
import type { Space } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { mergeHandlers } from "./mergeHandlers";
import { useEraserTool } from "./useEraserTool";
import { useLoupe } from "./useLoupe";
import { usePanZoom } from "./usePanZoom";
import { usePlanRooms } from "./usePlanRooms";
import { useRoomLineTool } from "./useRoomLineTool";
import { useRoomTap } from "./useRoomTap";
import { useSnapper } from "./useSnapper";
import { useTap } from "./useTap";
import { useWallTools } from "./useWallTools";

/** 2D 평면도가 받는 입력(줌·이동, 누르기, 벽 도구, 구역 선, 지우개, 구획 누르기, 터치 돋보기)을 처리기 하나씩으로 묶는다. */
export function useFloorPlanInput(ref: RefObject<HTMLElement | null>, space: Space) {
  const tool = useAppStore((state) => state.ui.tool);
  const { box, handlers: pan } = usePanZoom(ref, space.floor, tool === "select");
  const rooms = usePlanRooms(space);
  const snapAt = useSnapper(space.walls, box, space.floor);
  const wall = useWallTools(tool, box, snapAt);
  const roomLine = useRoomLineTool(tool, box, space.floor, rooms.lines);
  const eraser = useEraserTool(tool, box, space.walls, rooms.roomLines);
  const roomTap = useRoomTap(tool, box, space, rooms.lines);
  const tap = useTap(callAll(wall.tap, eraser.tap, roomTap));
  const loupe = useLoupe(tool);

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
    },
    finger: loupe.finger, // 돋보기를 띄울 손가락 자리
    // 같은 이벤트는 줌·이동 → 돋보기 → 누르기 → 그리기 도구 → 지우개 순서로 받는다
    handlers: mergeHandlers(
      pan,
      loupe.handlers,
      tap,
      wall.handlers,
      roomLine.handlers,
      eraser.handlers,
    ),
  };
}
