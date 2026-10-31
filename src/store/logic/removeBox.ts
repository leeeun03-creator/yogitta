import { isStackedOn } from "@/shared/lib/isStackedOn";
import { lowerStacked } from "@/shared/lib/lowerStacked";
import type { AppData } from "@/shared/types";
import { itemsWithinSlots } from "./itemsWithinSlots";
import { updateCurrentSpace } from "./updateCurrentSpace";

/**
 * 현재 공간에서 가구 하나를 지운다. moveTo가 같은 공간의 (남는) 다른 가구면 지우기 전에 물건을 모두 그 가구의
 * 칸 없음으로 옮긴다(칸 번호는 가구마다 뜻이 달라서). moveTo가 없거나 찾을 수 없으면 물건도 같이 지운다.
 * 그 위에 올린 가구는 withStacked면 (물건까지) 같이 지우고, 아니면 지운 가구 높이만큼 내린다(T29-4).
 * 없는 가구면 그대로 둔다.
 */
export function removeBox(
  data: AppData,
  id: string,
  moveTo?: string,
  withStacked = false,
): AppData {
  return updateCurrentSpace(data, (space) => {
    const removed = space.boxes.find((box) => box.id === id);
    if (!removed) return space;
    const isGone = (boxId: string) =>
      boxId === id || (withStacked && isStackedOn(space.boxes, boxId, id));
    const kept = lowerStacked(
      space.boxes.filter((box) => !isGone(box.id)),
      removed,
    );
    const moved = itemsWithinSlots(removed.items, 0); // 모두 칸 없음으로
    const boxes = kept.map((box) =>
      box.id === moveTo ? { ...box, items: [...box.items, ...moved] } : box,
    );
    return { ...space, boxes };
  });
}
