import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import { BOX_ROWS_RANGE } from "@/shared/constants/furniture";
import type { Box } from "@/shared/types";
import { IconButton } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import styles from "./BoxSizeFields.module.css";

const ICON_SIZE = 18;

/** 칸 수 스테퍼 (시안 04 "− 3 +"): 1 ~ 8칸, 끝에서는 더 못 누른다. 3D 서랍·선반 수가 따라간다. */
export function RowStepper({ box }: { box: Pick<Box, "id" | "rows"> }) {
  const changeBoxRows = useAppStore((state) => state.changeBoxRows);
  const labelId = useId();
  return (
    <div className={styles.stepperRow}>
      <p id={labelId} className={styles.label}>
        칸 수
      </p>
      <div role="group" aria-labelledby={labelId} className={styles.stepper}>
        <IconButton
          label="칸 줄이기"
          icon={<Minus size={ICON_SIZE} aria-hidden="true" />}
          disabled={box.rows <= BOX_ROWS_RANGE.min}
          onClick={() => changeBoxRows(box.id, box.rows - 1)}
        />
        <output className={styles.rows} aria-live="polite">
          {box.rows}칸
        </output>
        <IconButton
          label="칸 늘리기"
          icon={<Plus size={ICON_SIZE} aria-hidden="true" />}
          disabled={box.rows >= BOX_ROWS_RANGE.max}
          onClick={() => changeBoxRows(box.id, box.rows + 1)}
        />
      </div>
    </div>
  );
}
