import { useId, type FormEvent, type KeyboardEvent } from "react";
import { NameFormActions } from "./NameFormActions";
import styles from "./RoomList.module.css";

/** 입력칸 자체: 이름(aria-label)과, 있으면 보기 글자·최대 글자 수. */
type NameField = { label: string; placeholder?: string; maxLength?: number };

type NameFormProps = {
  field: NameField;
  value: string;
  error?: string; // 있으면 오류 상태 + 아래 안내 문구
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onRemove?: () => void; // 있으면 삭제 버튼을 보인다 (구역 이름 바꾸기 때)
};

/** Esc를 누르면 닫는다. 여기서 멈춰 바깥(공간 전환 목록 등)까지 닫히지 않게 한다. */
const cancelOnEscape = (onCancel: () => void) => (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  onCancel();
};

/**
 * 이름 입력칸 (구역 이름, 공간 이름 바꾸기). Enter·확인으로 정하고 Esc·취소로 닫는다.
 * Esc는 여기서 멈춰 바깥(공간 전환 목록 등)까지 닫히지 않게 한다.
 */
export function NameForm({
  field,
  value,
  error,
  onChange,
  onSubmit,
  onCancel,
  onRemove,
}: NameFormProps) {
  const errorId = useId();
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={cancelOnEscape(onCancel)}>
      <input
        className={styles.input}
        aria-label={field.label}
        placeholder={field.placeholder}
        value={value}
        maxLength={field.maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoFocus
      />
      <NameFormActions onCancel={onCancel} onRemove={onRemove} />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </form>
  );
}
