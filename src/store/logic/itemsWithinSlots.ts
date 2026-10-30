import type { Item } from "@/shared/types";

/** 칸 없음으로 옮긴 물건 (칸 번호를 뺀 복사본). */
function withoutSlot(item: Item): Item {
  const next = { ...item };
  delete next.slot;
  return next;
}

/** 칸 수(slotCount)보다 뒤 칸에 있던 물건은 칸 없음으로 옮기고, 나머지 물건은 그대로 둔다. */
export function itemsWithinSlots(items: readonly Item[], slotCount: number): Item[] {
  return items.map((item) =>
    item.slot !== undefined && item.slot >= slotCount ? withoutSlot(item) : item,
  );
}
