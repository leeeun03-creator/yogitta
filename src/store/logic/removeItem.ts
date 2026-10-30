import type { AppData } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 현재 공간의 가구 하나에서 물건 하나를 뺀다. 없는 가구·없는 물건이면 그대로 둔다. */
export function removeItem(data: AppData, boxId: string, itemId: string): AppData {
  return updateBox(data, boxId, (box) =>
    box.items.some((item) => item.id === itemId)
      ? { ...box, items: box.items.filter((item) => item.id !== itemId) }
      : box,
  );
}
