import { useId } from "react";
import styles from "./ItemForms.module.css";

/** 고르기 선택지 하나: 값 글자와 보이는 이름. */
export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
};

/** 물건 입력의 고르기 칸 (칸·가구): 위에 이름표, 아래 고르기. */
export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={styles.selectField}>
      <label htmlFor={id} className={styles.selectLabel}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
