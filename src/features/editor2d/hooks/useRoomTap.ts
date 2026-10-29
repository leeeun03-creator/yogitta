import { findRoomAt, type FloorLine } from "@/features/spaces";
import type { Point, Space } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";

/**
 * 선택 도구로 2D 평면도를 누르면: 이미 구역인 구획은 그 구역을 고르고(다시 누르면 닫음),
 * 이름 없는 구획은 그 자리에 새 구역 이름 입력칸을 연다. 벽·구역 선 위나 바닥 밖은 닫는다.
 */
export function useRoomTap(tool: DrawingTool, box: ViewBox, space: Space, lines: FloorLine[]) {
  const focus = useAppStore((state) => state.ui.roomFocus);
  const setRoomFocus = useAppStore((state) => state.setRoomFocus);

  return (screen: Point) => {
    if (tool !== "select") return;
    const point = screenToCm(screen, box);
    const hit = findRoomAt(space.floor, lines, space.rooms, space.roomAnchors ?? {}, point);
    if (hit?.type === "room") {
      const isSelected = focus?.type === "rename" && focus.room === hit.room;
      setRoomFocus(isSelected ? null : { type: "rename", room: hit.room });
    } else {
      setRoomFocus(hit);
    }
  };
}
