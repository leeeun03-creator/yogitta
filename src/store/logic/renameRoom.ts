import type { AppData } from "@/shared/types";
import type { RoomResult } from "./addRoom";
import { checkRoomName } from "./checkRoomName";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 이름(key) 하나만 바꾼 복사본. 없는 이름이면 그대로 복사한다. */
function renameKey<T>(record: Record<string, T>, from: string, to: string): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key === from ? to : key, value]),
  );
}

/**
 * 현재 공간의 구역 이름을 바꾸고 구역 기준점도 같이 옮긴다. 자리(순서)는 그대로다.
 * 가구 구역은 놓인 자리에서 계산하므로(boxRooms) 가구는 건드리지 않는다.
 */
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
      ...(space.roomAnchors && { roomAnchors: renameKey(space.roomAnchors, from, to) }),
    })),
  };
}
