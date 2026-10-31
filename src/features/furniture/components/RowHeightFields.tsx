import { useId, type KeyboardEvent } from "react";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box } from "@/shared/types";
import { TextField } from "@/shared/ui";
import { useRowHeightDraft } from "../hooks/useRowHeightDraft";
import { rowHeightMessage } from "../logic/rowHeightMessage";
import styles from "./BoxSizeFields.module.css";

/**
 * 칸 높이 입력칸 (시안 04, T30): 위 칸부터 "1번째 서랍 [30]". Enter나 입력칸을 벗어나면 그 칸을 바꾸고, Esc면 지금
 * 높이로 돌린다. 숫자가 아니거나 막히는 높이(최소보다 작음·합이 전체 높이를 넘음)는 바꾸지 않고 까닭을 띄운다.
 * 칸 높이가 바뀌면 부르는 쪽에서 key로 새로 그린다. 양문 수납장은 왼쪽·오른쪽 칸이 같은 높이라 줄마다 하나다.
 */
export function RowHeightFields({ box }: { box: Box }) {
  const { drafts, error, save, cancel, change } = useRowHeightDraft(box);
  const labels = slotLabels({ ...box, cols: 1 });
  const labelId = useId();
  const errorId = useId();
  const handleKeyDown = (row: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") save(row);
    if (event.key === "Escape") cancel();
  };
  return (
    <div className={styles.field}>
      <p id={labelId} className={styles.label}>
        칸 높이 (cm)
      </p>
      <div role="group" aria-labelledby={labelId} className={styles.rowHeights}>
        {drafts.map((draft, row) => (
          <TextField
            key={row}
            inline
            label={labels[row] ?? `${row + 1}번째 칸`}
            value={draft}
            inputMode="decimal"
            invalid={error?.row === row ? { describedBy: errorId } : undefined}
            onChange={(value) => change(row, value)}
            onKeyDown={handleKeyDown(row)}
            onBlur={() => save(row)}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {rowHeightMessage(error.reason, box.h)}
        </p>
      )}
    </div>
  );
}
