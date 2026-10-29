import { useMemo } from "react";
import { roomAreas } from "@/features/spaces";
import type { RoomLine, Space, Wall } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";

const NO_ROOM_LINES: RoomLine[] = [];

/**
 * 구획을 나누는 선(벽 + 구역 선)과 칠할 구역, 고른 구역. 벽·구역 선·구역이 바뀔 때만 다시 계산한다
 * (구획 계산은 바닥 격자를 모두 훑어서 그릴 때마다 하지 않는다).
 */
export function usePlanRooms(space: Space) {
  const { floor, walls, rooms, roomAnchors } = space;
  const roomLines = space.roomLines ?? NO_ROOM_LINES;
  const focus = useAppStore((state) => state.ui.roomFocus);
  const lines = useMemo<(Wall | RoomLine)[]>(() => [...walls, ...roomLines], [walls, roomLines]);
  const areas = useMemo(
    () => roomAreas(floor, lines, rooms, roomAnchors),
    [floor, lines, rooms, roomAnchors],
  );
  return {
    roomLines,
    lines,
    areas,
    selected: focus?.type === "rename" ? focus.room : null,
  };
}
