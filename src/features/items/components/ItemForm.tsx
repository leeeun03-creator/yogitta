import type { KeyboardEvent } from "react";
import { ITEM_MEMO_MAX_LENGTH, ITEM_NAME_MAX_LENGTH } from "@/shared/constants/item";
import type { Box } from "@/shared/types";
import { Button, TextField } from "@/shared/ui";
import { useItemForm, type ItemFields } from "../hooks/useItemForm";
import { itemMessage } from "../logic/itemMessage";
import { slotOptions } from "../logic/slotOptions";
import styles from "./ItemForms.module.css";
import { SelectField } from "./SelectField";

/** 입력 종류마다 입력 이름과 보내기 버튼 글자. */
const KINDS = {
  add: { label: "물건 넣기", submit: "넣기" },
  edit: { label: "물건 고치기", submit: "저장" },
} as const;

type FormState = ReturnType<typeof useItemForm>;
type ItemFormProps = {
  box: Box;
  kind: keyof typeof KINDS;
  initial: ItemFields;
  save: Parameters<typeof useItemForm>[1]; // 넣기·고치기 (막히면 까닭)
  onClose: () => void;
  boxes?: readonly Box[]; // 옮길 수 있는 가구 (고치기). 둘 이상이면 [가구] 고르기가 생긴다
};

/** Esc는 입력만 닫고 여기서 멈춘다 (가구 상세 패널까지 닫히지 않게). */
const escapeOnly = (onClose: () => void) => (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  onClose();
};

/**
 * 물건 넣기·고치기 입력 (이름·가구·칸·메모). 열리면 이름 칸에 초점, Enter·[넣기]·[저장]으로 save하고 닫힌다.
 * 칸을 안 고르면 칸 없음. Esc·[취소]는 입력만 닫는다 (가구 상세 패널은 그대로 두게 Esc를 여기서 멈춘다).
 * 너무 긴 이름·메모는 막는 안내를 보이게 최대 글자 수보다 조금 더(2배) 받는다.
 */
export function ItemForm({ box, kind, initial, save, onClose, boxes }: ItemFormProps) {
  const form = useItemForm(initial, save, onClose);
  const { fields, error } = form;
  return (
    <form
      className={styles.form}
      aria-label={KINDS[kind].label}
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
      <PlaceFields box={box} boxes={boxes} form={form} />
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
          {KINDS[kind].submit}
        </Button>
      </div>
    </form>
  );
}

/** 놓을 곳: [가구](옮길 수 있는 다른 가구가 있을 때만) + 고른 가구의 [칸]. */
function PlaceFields({
  box,
  boxes = [],
  form,
}: Pick<ItemFormProps, "box" | "boxes"> & { form: FormState }) {
  const { boxId = box.id, slotValue } = form.fields;
  const target = boxes.find((candidate) => candidate.id === boxId) ?? box;
  return (
    <>
      {boxes.length > 1 && (
        <SelectField
          label="가구"
          value={boxId}
          options={boxes.map((candidate) => ({ value: candidate.id, label: candidate.name }))}
          onChange={form.setBoxId}
        />
      )}
      <SelectField
        label="칸"
        value={slotValue}
        options={slotOptions(target)}
        onChange={form.setSlotValue}
      />
    </>
  );
}
