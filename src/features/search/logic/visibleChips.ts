import { SAME_SLOT_CHIP_LIMIT } from "@/shared/constants/item";

/** 같은 칸 물건 칩 중 보일 것과 "외 n개"로 묶을 수 (T14). 펼치면 모두 보이고 묶는 수는 0이다. */
export function visibleChips<T>(items: readonly T[], isExpanded: boolean) {
  const shown = isExpanded ? [...items] : items.slice(0, SAME_SLOT_CHIP_LIMIT);
  return { shown, restCount: items.length - shown.length };
}
