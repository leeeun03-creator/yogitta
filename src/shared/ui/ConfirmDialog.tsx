import { useId, type KeyboardEvent, type ReactNode, type Ref, type SyntheticEvent } from "react";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";
import { useModalDialog } from "./useModalDialog";

/** 다른 방법으로 하기: 고르기 같은 입력(field)과 그 버튼 (예: 옮길 가구 + [옮기고 지우기]). */
export type ConfirmAlternative = { field: ReactNode; label: string; onConfirm: () => void };

type ConfirmDialogProps = {
  title: string; // 묻는 말 ("'형 방'을 지울까요?")
  message: string; // 무엇이 어떻게 되는지
  confirmLabel: string; // 되돌릴 수 없는 쪽 버튼 ("지우기")
  onConfirm: () => void;
  onCancel: () => void;
  alternative?: ConfirmAlternative;
};

/** Esc로 닫힐 때: 브라우저가 닫기 전에 직접 닫고 초점을 돌린다. */
const cancelOnEscape = (event: SyntheticEvent, cancel: () => void) => {
  event.preventDefault();
  cancel();
};

type ConfirmTextProps = { ids: { title: string; message: string }; title: string; message: string };

/** 묻는 말(제목)과 설명. 대화상자의 이름·설명이 된다. */
function ConfirmText({ ids, title, message }: ConfirmTextProps) {
  return (
    <>
      <h2 id={ids.title} className={styles.title}>
        {title}
      </h2>
      <p id={ids.message} className={styles.message}>
        {message}
      </p>
    </>
  );
}

/** Esc는 여기서 멈춰, 대화상자를 연 목록 등 바깥까지 닫히지 않게 한다. */
const stopEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") event.stopPropagation();
};

/**
 * 되돌릴 수 없는 일을 하기 전에 묻는 대화상자 (삭제 버튼 시안 06). 나타나면 바로 열리고, 처음 초점은 [취소]다
 * (Enter를 잘못 눌러도 지워지지 않게). Esc·취소·바깥 누르기는 취소다. alternative가 있으면 그 입력과 버튼을
 * 설명 아래에 둔다. 어느 쪽이든 먼저 닫아 연 버튼으로 초점을 돌린 뒤 한다.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  alternative,
}: ConfirmDialogProps) {
  const { dialogRef, firstRef, close } = useModalDialog<HTMLButtonElement>();
  const titleId = useId();
  const messageId = useId();
  const closeThen = (action: () => void) => () => {
    close();
    action();
  };
  const cancel = closeThen(onCancel);
  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => cancelOnEscape(event, cancel)}
      onKeyDown={stopEscape}
      onClick={(event) => event.target === event.currentTarget && cancel()}
    >
      <ConfirmText ids={{ title: titleId, message: messageId }} title={title} message={message} />
      {alternative && (
        <AlternativeRow {...alternative} onConfirm={closeThen(alternative.onConfirm)} />
      )}
      <ConfirmButtons
        firstRef={firstRef}
        label={confirmLabel}
        onCancel={cancel}
        onConfirm={closeThen(onConfirm)}
      />
    </dialog>
  );
}

type ConfirmButtonsProps = {
  firstRef: Ref<HTMLButtonElement>;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/** [취소](처음 초점)와 되돌릴 수 없는 쪽 버튼. */
function ConfirmButtons({ firstRef, label, onCancel, onConfirm }: ConfirmButtonsProps) {
  return (
    <div className={styles.actions}>
      <Button ref={firstRef} onClick={onCancel}>
        취소
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        {label}
      </Button>
    </div>
  );
}

/** 다른 방법으로 하기 줄: 입력과 그 버튼. */
function AlternativeRow({ field, label, onConfirm }: ConfirmAlternative) {
  return (
    <div className={styles.alternative}>
      {field}
      <Button onClick={onConfirm}>{label}</Button>
    </div>
  );
}
