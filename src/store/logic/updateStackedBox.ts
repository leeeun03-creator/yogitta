import { carryStacked } from "@/shared/lib/carryStacked";
import type { AppData, Box, Space } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/**
 * updateBox처럼 현재 공간의 가구 하나를 바꾸고, 그 위에 올린 가구도 같이 옮긴다 (옮기기·돌리기·높이, T29-2).
 * 없는 가구이거나 바뀌지 않았으면 원본 그대로다.
 */
export function updateStackedBox(
  data: AppData,
  id: string,
  update: (box: Box, space: Space) => Box,
): AppData {
  return updateCurrentSpace(data, (space) => {
    const current = space.boxes.find((box) => box.id === id);
    if (!current) return space;
    const next = update(current, space);
    if (next === current) return space;
    const replaced = space.boxes.map((box) => (box === current ? next : box));
    return { ...space, boxes: [...carryStacked(replaced, current, next, space.floor)] };
  });
}
