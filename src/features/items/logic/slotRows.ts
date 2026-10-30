import { NO_SLOT_LABEL } from "@/shared/constants/item";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box, Item } from "@/shared/types";

/** 가구 상세 패널의 칸 행 하나. slot이 없으면 칸 없음 행이다. */
export type SlotRow = { key: string; slot?: number; label: string; items: Item[] };

/**
 * 가구의 칸마다 행(칸 이름 + 그 칸 물건, 넣은 순서)을 위 칸부터 만든다. 칸 없음에 물건이 있으면 맨 아래에 칸 없음 행을 붙인다.
 * 칸 수 밖 번호가 남은 물건(칸 수를 줄인 옛 데이터 등)도 칸 없음 행에 넣는다.
 */
export function slotRows(box: Pick<Box, "type" | "rows" | "cols" | "items">): SlotRow[] {
  const labels = slotLabels(box);
  const rows = labels.map((label, slot) => ({
    key: `slot-${slot}`,
    slot,
    label,
    items: box.items.filter((item) => item.slot === slot),
  }));
  const loose = box.items.filter((item) => item.slot === undefined || item.slot >= labels.length);
  return loose.length > 0
    ? [...rows, { key: "no-slot", label: NO_SLOT_LABEL, items: loose }]
    : rows;
}
