import { useEffect, useId, useRef } from "react";
import { FURNITURE_LABELS } from "@/shared/constants/furniture";
import { FURNITURE_TYPES, type FurnitureType } from "@/shared/types";
import styles from "./FurnitureTypePicker.module.css";

type FurnitureTypePickerProps = {
  value: FurnitureType;
  onChange: (type: FurnitureType) => void;
};

/**
 * 종류 선택 (시안 08 FurnitureTypePicker): 정해진 8종을 4열로 놓고, 지금 종류는 강조색으로 눌린 상태다.
 * 지금 종류를 다시 누르면 아무것도 바뀌지 않는다. 휴대폰은 한 줄로 넘겨 보므로 지금 종류가 보이게 넘긴다.
 */
export function FurnitureTypePicker({ value, onChange }: FurnitureTypePickerProps) {
  const labelId = useId();
  const pressedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    pressedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);
  return (
    <div className={styles.field}>
      <p id={labelId} className={styles.label}>
        종류
      </p>
      <div role="group" aria-labelledby={labelId} className={styles.grid}>
        {FURNITURE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            ref={type === value ? pressedRef : undefined}
            aria-pressed={type === value}
            className={styles.type}
            onClick={() => onChange(type)}
          >
            {FURNITURE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
