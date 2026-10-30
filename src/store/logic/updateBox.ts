import type { AppData, Box, Floor } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/** 현재 공간의 가구 하나만 바꾼 새 데이터를 돌려준다. 없는 가구이거나 바뀌지 않았으면 원본 그대로다. */
export function updateBox(
  data: AppData,
  id: string,
  update: (box: Box, floor: Floor) => Box,
): AppData {
  return updateCurrentSpace(data, (space) => {
    const index = space.boxes.findIndex((box) => box.id === id);
    const current = space.boxes[index];
    if (!current) return space;

    const next = update(current, space.floor);
    if (next === current) return space;
    const boxes = [...space.boxes];
    boxes[index] = next;
    return { ...space, boxes };
  });
}
