import type { Box } from "@/shared/types";
import { slotRows } from "../logic/slotRows";
import styles from "./SlotRowList.module.css";

type SlotRowListProps = {
  box: Box;
  pickedId: string | null; // 눌러서 자세히 보는 물건
  onPick: (itemId: string) => void;
  onAdd: (slot: number) => void; // 빈 칸의 [+ 추가]
  foundId: string | null; // 검색으로 찾은 물건: 그 칸 행과 칩을 강조한다
};

/**
 * 칸마다 행 (시안 08 칸 행): 칸 이름 + 물건 칩(넣은 순서, 누르면 자세히), 빈 칸은 "비어 있어요"와 [+ 추가].
 * 칸 없음에 물건이 있으면 맨 아래 행. 검색으로 찾은 물건이 있으면 그 칸 행은 찾은 칸 배경, 그 칩은 굵은 강조색이다.
 */
export function SlotRowList({ box, pickedId, onPick, onAdd, foundId }: SlotRowListProps) {
  return (
    <ul className={styles.rows} aria-label="칸별 물건">
      {slotRows(box).map((row) => (
        <li
          key={row.key}
          className={styles.row}
          data-found={row.items.some((item) => item.id === foundId) || undefined}
        >
          <span className={styles.slotName}>{row.label}</span>
          {row.items.length === 0 ? (
            <EmptySlot
              label={row.label}
              onAdd={row.slot === undefined ? null : () => onAdd(row.slot ?? 0)}
            />
          ) : (
            <ul className={styles.chips} aria-label={`${row.label} 물건`}>
              {row.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.chip}
                    aria-pressed={item.id === pickedId}
                    data-found={item.id === foundId || undefined}
                    onClick={() => onPick(item.id)}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/** 빈 칸: "비어 있어요"와 그 칸에 넣는 [+ 추가] (시안 08 빈 칸). */
function EmptySlot({ label, onAdd }: { label: string; onAdd: (() => void) | null }) {
  return (
    <>
      <span className={styles.empty}>비어 있어요</span>
      {onAdd && (
        <button
          type="button"
          className={styles.addChip}
          aria-label={`${label}에 물건 추가`}
          onClick={onAdd}
        >
          + 추가
        </button>
      )}
    </>
  );
}
