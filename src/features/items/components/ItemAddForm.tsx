import type { KeyboardEvent } from "react";
import { ITEM_MEMO_MAX_LENGTH, ITEM_NAME_MAX_LENGTH } from "@/shared/constants/item";
import type { Box } from "@/shared/types";
import { Button, TextField } from "@/shared/ui";
import { useItemForm } from "../hooks/useItemForm";
import { itemMessage } from "../logic/itemMessage";
import styles from "./ItemForms.module.css";
import { SlotSelect } from "./SlotSelect";

type ItemAddFormProps = { box: Box; slot?: number; onClose: () => void };

/** Esc는 입력만 닫고 여기서 멈춘다 (가구 상세 패널까지 닫히지 않게). */
const escapeOnly = (onClose: () => void) => (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  onClose();
};

/**
 * 물건 넣기 입력 (이름·칸·메모). 열리면 이름 칸에 초점, Enter·[넣기]로 넣고 닫힌다. 칸을 안 고르면 칸 없음.
 * Esc·[취소]는 입력만 닫는다 (가구 상세 패널은 그대로 두게 Esc를 여기서 멈춘다).
 * 너무 긴 이름·메모는 막는 안내를 보이게 최대 글자 수보다 조금 더(2배) 받는다.
 */
export function ItemAddForm({ box, slot, onClose }: ItemAddFormProps) {
  const form = useItemForm(box.id, slot, onClose);
  const { fields, error } = form;
  return (
    <form
      className={styles.form}
      aria-label="물건 넣기"
      onSubmit={form.submit}
      onKeyDown={escapeOnly(onClose)}
      noValidate
    >
      <TextField
        label="물건 이름"
        value={fields.name}
        onChange={form.setName}
        maxLength={ITEM_NAME_MAX_LENGTH * 2}
        error={error && error !== "memoTooLong" ? itemMessage(error) : undefined}
        autoFocus
      />
      <SlotSelect box={box} value={fields.slotValue} onChange={form.setSlotValue} />
      <TextField
        label="메모 (선택)"
        value={fields.memo}
        onChange={form.setMemo}
        maxLength={ITEM_MEMO_MAX_LENGTH * 2}
        error={error === "memoTooLong" ? itemMessage(error) : undefined}
      />
      <div className={styles.formActions}>
        <Button onClick={onClose}>취소</Button>
        <Button type="submit" variant="primary">
          넣기
        </Button>
      </div>
    </form>
  );
}
