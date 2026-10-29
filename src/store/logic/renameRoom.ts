import type { AppData } from "@/shared/types";
import type { RoomResult } from "./addRoom";
import { checkRoomName } from "./checkRoomName";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 현재 공간의 구역 이름을 바꾸고, 그 구역에 있던 가구의 구역도 같이 바꾼다. 자리(순서)는 그대로다. */
export function renameRoom(data: AppData, from: string, input: string): RoomResult {
  const current = data.spaces.find((space) => space.id === data.currentSpaceId);
  if (!current?.rooms.includes(from)) return { ok: true, data };
  const check = checkRoomName(current.rooms, input, from);
  if (!check.ok) return check;
  const to = check.name;
  if (to === from) return { ok: true, data };
  return {
    ok: true,
    data: updateCurrentSpace(data, (space) => ({
      ...space,
      rooms: space.rooms.map((room) => (room === from ? to : room)),
      boxes: space.boxes.map((box) => (box.room === from ? { ...box, room: to } : box)),
    })),
  };
}
