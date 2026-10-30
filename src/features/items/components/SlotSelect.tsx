import { useId } from "react";
import { NO_SLOT_LABEL } from "@/shared/constants/item";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box } from "@/shared/types";
import styles from "./ItemForms.module.css";

type SlotSelectProps = {
  box: Pick<Box, "type" | "rows" | "cols">;
  value: string; // 칸 번호 글자, 빈 글자는 칸 없음
  onChange: (value: string) => void;
};

/** 물건을 넣을 칸 고르기: 그 가구의 칸 이름들 + 칸 없음. */
export function SlotSelect({ box, value, onChange }: SlotSelectProps) {
  const id = useId();
  return (
    <div className={styles.selectField}>
      <label htmlFor={id} className={styles.selectLabel}>
        칸
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {slotLabels(box).map((label, index) => (
          <option key={label} value={String(index)}>
            {label}
          </option>
        ))}
        <option value="">{NO_SLOT_LABEL}</option>
      </select>
    </div>
  );
}
