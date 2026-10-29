import type { AppData, Point } from "@/shared/types";
import { checkRoomName, type RoomNameError } from "./checkRoomName";
import { updateCurrentSpace } from "./updateCurrentSpace";

export type RoomResult = { ok: true; data: AppData } | { ok: false; reason: RoomNameError };

/**
 * 현재 공간의 구역 목록 끝에 구역 하나를 더한다. at이 있으면 그 자리를 구역 기준점으로 둔다(그 점이 든 구획이 이 구역).
 * 현재 공간이 없으면 그대로 돌려준다.
 */
export function addRoom(data: AppData, input: string, at?: Point): RoomResult {
  const current = data.spaces.find((space) => space.id === data.currentSpaceId);
  if (!current) return { ok: true, data };
  const check = checkRoomName(current.rooms, input);
  if (!check.ok) return check;
  return {
    ok: true,
    data: updateCurrentSpace(data, (space) => ({
      ...space,
      rooms: [...space.rooms, check.name],
      ...(at && { roomAnchors: { ...space.roomAnchors, [check.name]: { x: at.x, y: at.y } } }),
    })),
  };
}
