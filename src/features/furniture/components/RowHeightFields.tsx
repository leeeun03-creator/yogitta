import { useId, useState } from "react";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box } from "@/shared/types";
import { TextField } from "@/shared/ui";
import { useRowHeightDraft } from "../hooks/useRowHeightDraft";
import { draftKeys } from "../logic/draftKeys";
import { rowHeightMessage } from "../logic/rowHeightMessage";
import { rowSum } from "../logic/rowSum";
import styles from "./BoxSizeFields.module.css";
import { RowHeightBar } from "./RowHeightBar";

/**
 * 칸 높이 입력칸 (시안 04, T30): 위 칸부터 "1번째 서랍 [30]". Enter나 입력칸을 벗어나면 그 칸을 바꾸고, Esc면 지금
 * 높이로 돌린다. 숫자가 아니거나 막히는 높이(최소보다 작음·합이 전체 높이를 넘음)는 바꾸지 않고 까닭을 띄운다.
 * 칸 높이가 바뀌면 부르는 쪽에서 key로 새로 그린다. 양문 수납장은 왼쪽·오른쪽 칸이 같은 높이라 줄마다 하나다.
 * 왼쪽에 칸 비율 미리보기 막대, 아래에 합계 줄을 입력 중인 값으로 보여 준다 (T30-2).
 */
export function RowHeightFields({ box }: { box: Box }) {
  const draft = useRowHeightDraft(box);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const sum = rowSum(draft.heights, box.h);
  const labelId = useId();
  const errorId = useId();
  return (
    <div className={styles.field}>
      <p id={labelId} className={styles.label}>
        칸 높이 (cm)
      </p>
      <div className={styles.rowArea}>
        <RowHeightBar heights={draft.heights} totalCm={box.h} activeRow={activeRow} />
        <div role="group" aria-labelledby={labelId} className={styles.rowHeights}>
          <RowHeightInputs box={box} draft={draft} errorId={errorId} onActive={setActiveRow} />
        </div>
      </div>
      <p className={sum.isOver ? styles.sumOver : styles.sum} data-over={sum.isOver || undefined}>
        {sum.text}
      </p>
      {draft.error && (
        <p id={errorId} className={styles.error}>
          {rowHeightMessage(draft.error.reason, box.h)}
        </p>
      )}
    </div>
  );
}

type RowHeightInputsProps = {
  box: Box;
  draft: ReturnType<typeof useRowHeightDraft>;
  errorId: string; // 막힌 까닭 문구
  onActive: (row: number | null) => void; // 입력 중인 칸 (미리보기 막대 강조)
};

/** 칸마다 높이 입력칸. 막힌 칸은 오류 상태로 까닭 문구를 가리킨다. */
function RowHeightInputs({ box, draft, errorId, onActive }: RowHeightInputsProps) {
  const labels = slotLabels({ ...box, cols: 1 });
  const handleKeyDown = (row: number) => draftKeys(() => draft.save(row), draft.cancel);
  return draft.drafts.map((value, row) => (
    <TextField
      key={row}
      inline
      label={labels[row] ?? `${row + 1}번째 칸`}
      value={value}
      inputMode="decimal"
      invalid={draft.error?.row === row ? { describedBy: errorId } : undefined}
      onChange={(next) => draft.change(row, next)}
      onKeyDown={handleKeyDown(row)}
      onFocus={() => onActive(row)}
      onBlur={() => {
        onActive(null);
        draft.save(row);
      }}
    />
  ));
}
