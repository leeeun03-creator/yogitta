import type { AppData } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 현재 공간에서 구역 선 하나를 지운다. 없는 선이면 그대로 둔다. */
export function removeRoomLine(data: AppData, id: string): AppData {
  return updateCurrentSpace(data, (space) => {
    const lines = space.roomLines ?? [];
    if (!lines.some((line) => line.id === id)) return space;
    return { ...space, roomLines: lines.filter((line) => line.id !== id) };
  });
}
