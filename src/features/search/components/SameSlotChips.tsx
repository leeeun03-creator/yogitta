import { useId, useState } from "react";
import type { Item } from "@/shared/types";
import { visibleChips } from "../logic/visibleChips";
import styles from "./ResultCard.module.css";

/**
 * 같은 칸에 있는 물건 칩 줄 (시안 07, T14): "같은 칸에 있는 물건 [비상금] [양말] … [외 3개]".
 * 칩은 4개까지 보이고 나머지는 "외 n개"로 묶으며, 누르면 모두 펼친다(T14-3). 칩을 누르면 그 물건을 찾는다(T14-2).
 * 같은 칸에 다른 물건이 없으면 그리지 않는다.
 */
export function SameSlotChips(props: { items: readonly Item[]; onSearch: (name: string) => void }) {
  const { items, onSearch } = props;
  const labelId = useId();
  const [isExpanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const { shown, restCount } = visibleChips(items, isExpanded);
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
        {restCount > 0 && (
          <li>
            <button type="button" className={styles.moreChip} onClick={() => setExpanded(true)}>
              외 {restCount}개
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
