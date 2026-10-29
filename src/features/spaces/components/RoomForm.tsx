import { useId, type FormEvent, type KeyboardEvent } from "react";
import { ROOM_NAME_MAX_LENGTH } from "@/shared/constants/room";
import { RoomFormActions } from "./RoomFormActions";
import styles from "./RoomList.module.css";

type RoomFormProps = {
  label: string; // 입력칸 이름 ("새 구역 이름" / "구역 이름")
  value: string;
  error?: string; // 있으면 오류 상태 + 아래 안내 문구
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onRemove?: () => void; // 있으면 삭제 버튼을 보인다 (이름 바꾸기 때)
};

/** 구역 이름 입력칸. Enter·확인으로 정하고 Esc·취소로 닫는다. */
export function RoomForm({
  label,
  value,
  error,
  onChange,
  onSubmit,
  onCancel,
  onRemove,
}: RoomFormProps) {
  const errorId = useId();
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") onCancel();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <input
        className={styles.input}
        aria-label={label}
        placeholder={onRemove ? undefined : "예: 안방"}
        value={value}
        maxLength={ROOM_NAME_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoFocus
      />
      <RoomFormActions onCancel={onCancel} onRemove={onRemove} />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </form>
  );
}
