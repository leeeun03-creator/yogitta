import type { AppData } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 현재 공간에서 가구 하나를 지운다. 없는 가구면 그대로 둔다. (물건이 든 가구의 확인은 T16) */
export function removeBox(data: AppData, id: string): AppData {
  return updateCurrentSpace(data, (space) => {
    if (!space.boxes.some((box) => box.id === id)) return space;
    return { ...space, boxes: space.boxes.filter((box) => box.id !== id) };
  });
}
