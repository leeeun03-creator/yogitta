import type { AppData } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 이름(key) 하나를 뺀 복사본. */
function withoutKey<T>(record: Record<string, T>, name: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== name));
}

/**
 * 현재 공간에서 구역과 그 구역 기준점을 지운다. 없는 구역이면 그대로 돌려준다.
 * 그 구역에 있던 가구는 놓인 자리에서 계산하므로(boxRooms) 저절로 구역 없음이 된다.
 */
export function removeRoom(data: AppData, name: string): AppData {
  return updateCurrentSpace(data, (space) => {
    if (!space.rooms.includes(name)) return space;
    return {
      ...space,
      rooms: space.rooms.filter((room) => room !== name),
      ...(space.roomAnchors && { roomAnchors: withoutKey(space.roomAnchors, name) }),
    };
  });
}
