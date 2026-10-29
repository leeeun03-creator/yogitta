import type { AppData, Box } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 구역을 뺀 가구 복사본 (room 칸을 아예 지워 "구역 없음"으로 둔다). 원본은 바꾸지 않는다. */
function withoutRoom(box: Box): Box {
  const copy = { ...box };
  delete copy.room;
  return copy;
}

/** 현재 공간에서 구역을 지운다. 그 구역에 있던 가구는 구역 없음이 된다. 없는 구역이면 그대로 돌려준다. */
export function removeRoom(data: AppData, name: string): AppData {
  return updateCurrentSpace(data, (space) => {
    if (!space.rooms.includes(name)) return space;
    return {
      ...space,
      rooms: space.rooms.filter((room) => room !== name),
      boxes: space.boxes.map((box) => (box.room === name ? withoutRoom(box) : box)),
    };
  });
}
