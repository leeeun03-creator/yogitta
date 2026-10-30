import { useId, type InputHTMLAttributes, type Ref } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string; // 있으면 오류 상태 + 아래 안내 문구
  invalid?: { describedBy: string }; // 안내 문구를 입력칸 묶음 아래에 따로 둘 때: 오류 상태만 + 그 문구를 가리킨다
  ref?: Ref<HTMLInputElement>;
};

/** 라벨이 붙은 입력칸. 상태(기본·포커스·오류)는 컴포넌트 시안 06을 따른다. */
export function TextField({
  label,
  value,
  onChange,
  error,
  invalid,
  ref,
  ...rest
}: TextFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={error ? styles.labelError : styles.label}>
        {label}
      </label>
      <input
        {...rest}
        ref={ref}
        id={inputId}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error || invalid ? true : undefined}
        aria-describedby={error ? errorId : invalid?.describedBy}
      />
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
