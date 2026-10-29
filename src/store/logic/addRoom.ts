import type { AppData } from "@/shared/types";
import { checkRoomName, type RoomNameError } from "./checkRoomName";
import { updateCurrentSpace } from "./updateCurrentSpace";

export type RoomResult = { ok: true; data: AppData } | { ok: false; reason: RoomNameError };

/** 현재 공간의 구역 목록 끝에 구역 하나를 더한다. 현재 공간이 없으면 그대로 돌려준다. */
export function addRoom(data: AppData, input: string): RoomResult {
  const current = data.spaces.find((space) => space.id === data.currentSpaceId);
  if (!current) return { ok: true, data };
  const check = checkRoomName(current.rooms, input);
  if (!check.ok) return check;
  return {
    ok: true,
    data: updateCurrentSpace(data, (space) => ({ ...space, rooms: [...space.rooms, check.name] })),
  };
}
