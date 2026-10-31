import { useId } from "react";
import { SAME_SLOT_CHIP_LIMIT } from "@/shared/constants/item";
import type { Item } from "@/shared/types";
import styles from "./ResultCard.module.css";

/**
 * 같은 칸에 있는 물건 칩 줄 (시안 07, T14): "같은 칸에 있는 물건 [비상금] [양말] … [외 3개]".
 * 칩은 SAME_SLOT_CHIP_LIMIT개까지 보이고 나머지는 "외 n개"로 묶는다. 칩을 누르면 그 물건을 찾는다(onSearch, T14-2).
 * 같은 칸에 다른 물건이 없으면 그리지 않는다.
 */
export function SameSlotChips(props: { items: readonly Item[]; onSearch: (name: string) => void }) {
  const { items, onSearch } = props;
  const labelId = useId();
  if (items.length === 0) return null;
  const shown = items.slice(0, SAME_SLOT_CHIP_LIMIT);
  const restCount = items.length - shown.length;
  return (
    <div className={styles.sameSlot}>
      <span id={labelId} className={styles.sameSlotLabel}>
        같은 칸에 있는 물건
      </span>
      <ul className={styles.chips} aria-labelledby={labelId}>
        {shown.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.chip}
              aria-label={`${item.name} 찾기`}
              onClick={() => onSearch(item.name)}
            >
              {item.name}
            </button>
          </li>
        ))}
        {restCount > 0 && <li className={styles.moreChip}>외 {restCount}개</li>}
      </ul>
    </div>
  );
}
