import { useId, type SyntheticEvent } from "react";
import type { Floor } from "@/shared/types";
import { Button, TextField, useModalDialog } from "@/shared/ui";
import { useFloorResizeForm } from "../hooks/useFloorResizeForm";
import { metersMessage } from "../logic/metersMessage";
import styles from "./FloorResizeDialog.module.css";

type FloorResizeDialogProps = { floor: Floor; onClose: () => void };

/**
 * 바닥 크기 바꾸기 대화상자. 가로·세로(m)를 넣고 [바꾸기]면 바닥이 바뀌고(되돌리기 한 번) 닫힌다.
 * 범위 밖·숫자 아님은 칸 아래에, 바닥 밖으로 나가는 것이 있으면 버튼 위에 까닭을 띄운다. Esc·취소·바깥 누르기는 취소.
 */
export function FloorResizeDialog({ floor, onClose }: FloorResizeDialogProps) {
  const { dialogRef, firstRef, close } = useModalDialog<HTMLInputElement>();
  const titleId = useId();
  const done = () => {
    close();
    onClose();
  };
  const { fields, setWidth, setDepth, errors, submit } = useFloorResizeForm(floor, done);
  const cancelOnEscape = (event: SyntheticEvent) => {
    event.preventDefault(); // 브라우저가 닫기 전에 직접 닫고 초점을 돌린다
    done();
  };
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={cancelOnEscape}
      onClick={(event) => event.target === event.currentTarget && done()}
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        <h2 id={titleId} className={styles.title}>
          바닥 크기 바꾸기
        </h2>
        <div className={styles.fields}>
          <TextField
            ref={firstRef}
            label="가로 (m)"
            value={fields.width}
            onChange={setWidth}
            inputMode="decimal"
            error={errors.width && metersMessage(errors.width)}
          />
          <TextField
            label="세로 (m)"
            value={fields.depth}
            onChange={setDepth}
            inputMode="decimal"
            error={errors.depth && metersMessage(errors.depth)}
          />
        </div>
        {errors.isOutside && (
          <p role="alert" className={styles.outside}>
            벽·구역 선·가구가 바닥 밖으로 나가서 이 크기로 줄일 수 없어요
          </p>
        )}
        <div className={styles.actions}>
          <Button onClick={done}>취소</Button>
          <Button type="submit" variant="primary">
            바꾸기
          </Button>
        </div>
      </form>
    </dialog>
  );
}
