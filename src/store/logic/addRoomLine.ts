import type { AppData, RoomLine } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

const MIN_POINTS = 2;

/** 현재 공간에 구역 선 하나를 더한다. 점이 2개보다 적은 선은 더하지 않는다. */
export function addRoomLine(data: AppData, line: RoomLine): AppData {
  if (line.points.length < MIN_POINTS) return data;
  return updateCurrentSpace(data, (space) => ({
    ...space,
    roomLines: [...(space.roomLines ?? []), line],
  }));
}
