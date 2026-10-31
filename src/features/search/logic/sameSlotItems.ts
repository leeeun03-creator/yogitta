import type { Item } from "@/shared/types";
import type { ItemMatch } from "./matchItems";

/**
 * 찾은 물건과 같은 가구·같은 칸에 있는 다른 물건들 (T14). 칸 없음 물건은 칸 없음 물건끼리 같은 칸이다.
 * 가구에 넣은 순서대로다.
 */
export function sameSlotItems(match: Pick<ItemMatch, "box" | "item">): Item[] {
  const { box, item } = match;
  return box.items.filter((other) => other.id !== item.id && other.slot === item.slot);
}
