import type { AppData } from "@/shared/types";
import { itemsWithinSlots } from "./itemsWithinSlots";
import { updateCurrentSpace } from "./updateCurrentSpace";

/**
 * 현재 공간에서 가구 하나를 지운다. moveTo가 같은 공간의 다른 가구면 지우기 전에 물건을 모두 그 가구의
 * 칸 없음으로 옮긴다(칸 번호는 가구마다 뜻이 달라서). moveTo가 없거나 찾을 수 없으면 물건도 같이 지운다.
 * 없는 가구면 그대로 둔다.
 */
export function removeBox(data: AppData, id: string, moveTo?: string): AppData {
  return updateCurrentSpace(data, (space) => {
    const removed = space.boxes.find((box) => box.id === id);
    if (!removed) return space;
    const moved = itemsWithinSlots(removed.items, 0); // 모두 칸 없음으로
    const boxes = space.boxes
      .filter((box) => box !== removed)
      .map((box) => (box.id === moveTo ? { ...box, items: [...box.items, ...moved] } : box));
    return { ...space, boxes };
  });
}
