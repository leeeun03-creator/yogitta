import type { Point, Space } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { mergeHandlers } from "./mergeHandlers";
import { usePartHover } from "./usePartHover";
import { usePlanRooms } from "./usePlanRooms";
import { useRoomLineTool } from "./useRoomLineTool";
import { useRoomTap } from "./useRoomTap";

/**
 * 구역 입력: 구역 선 도구, 구획 누르기(구역 고르기·새 구역 입력칸), 누르면 새 구역이 될 구획 칠하기.
 * isCovered가 참인 자리(선택 도구에서 가구 위)는 구획을 칠하지 않는다.
 */
export function useRoomInput(
  tool: DrawingTool,
  view: ViewBox,
  space: Space,
  isCovered: (point: Point) => boolean,
) {
  const rooms = usePlanRooms(space);
  const roomLine = useRoomLineTool(tool, view, space.floor, rooms.lines);
  const tap = useRoomTap(tool, view, space, rooms.lines);
  const hover = usePartHover(tool, view, (at) => (isCovered(at) ? null : rooms.findUnnamed(at)));
  return {
    tap,
    scene: {
      roomLines: rooms.roomLines,
      roomLineDraft: roomLine.draft,
      roomAreas: rooms.areas,
      selectedRoom: rooms.selected,
      partPreview: hover.rects && { rects: hover.rects, color: rooms.nextColor },
    },
    handlers: mergeHandlers(roomLine.handlers, hover.handlers),
  };
}
