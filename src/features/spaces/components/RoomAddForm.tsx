import { Check, X } from "lucide-react";
import { useId, type FormEvent, type KeyboardEvent } from "react";
import { ROOM_NAME_MAX_LENGTH } from "@/shared/constants/room";
import { IconButton } from "@/shared/ui";
import styles from "./RoomList.module.css";

type RoomAddFormProps = {
  value: string;
  error?: string; // 있으면 오류 상태 + 아래 안내 문구
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

/** 새 구역 이름 입력칸. Enter·확인으로 더하고 Esc·취소로 닫는다. */
export function RoomAddForm({ value, error, onChange, onSubmit, onCancel }: RoomAddFormProps) {
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
        aria-label="새 구역 이름"
        placeholder="예: 안방"
        value={value}
        maxLength={ROOM_NAME_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoFocus
      />
      <IconButton type="submit" label="확인" icon={<Check size={20} strokeWidth={2} />} />
      <IconButton label="취소" icon={<X size={20} strokeWidth={2} />} onClick={onCancel} />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </form>
  );
}
