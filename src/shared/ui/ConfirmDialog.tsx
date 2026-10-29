import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  title: string; // 묻는 말 ("'형 방'을 지울까요?")
  message: string; // 무엇이 어떻게 되는지
  confirmLabel: string; // 되돌릴 수 없는 쪽 버튼 ("지우기")
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * 되돌릴 수 없는 일을 하기 전에 묻는 대화상자 (삭제 버튼 시안 06). 나타나면 바로 열리고, 처음 초점은 [취소]다
 * (Enter를 잘못 눌러도 지워지지 않게). Esc·취소·바깥 누르기는 취소이고, 취소하면 연 버튼으로 초점을 돌린다.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();
  // 연 버튼을 먼저 기억한 뒤 열고 [취소]에 초점을 둔다
  useEffect(() => {
    opener.current = document.activeElement;
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  }, []);

  // 모달이 열려 있는 동안은 뒤 화면에 초점을 줄 수 없어서, 먼저 닫고 연 버튼으로 초점을 돌린다
  const cancel = () => {
    dialogRef.current?.close();
    if (opener.current instanceof HTMLElement) opener.current.focus();
    onCancel();
  };
  // Esc는 여기서 멈춰, 대화상자를 연 목록 등 바깥까지 닫히지 않게 한다
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") event.stopPropagation();
  };

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.target === event.currentTarget && cancel()}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p id={messageId} className={styles.message}>
        {message}
      </p>
      <div className={styles.actions}>
        <Button ref={cancelRef} onClick={cancel}>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
