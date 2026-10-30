import { useState, type FormEvent } from "react";
import type { ItemError } from "@/store/useAppStore";

/** 물건 입력 값: 이름·칸 번호(없으면 칸 없음)·메모. */
export type ItemFields = { name: string; slot?: number; memo?: string };
type ItemSave = (fields: ItemFields) => { ok: true } | { ok: false; reason: ItemError };

/** 칸 고르기 값: 칸 번호 글자, 빈 글자는 칸 없음. */
const slotOf = (value: string) => (value === "" ? undefined : Number(value));

/**
 * 물건 입력(이름·칸·메모)과 막힌 까닭. initial로 채워 열고(넣기는 빈 이름, 고치기는 그 물건),
 * submit은 save(넣기·고치기)가 되면 onDone을 부르고, 막히면 까닭만 남긴다. 글자를 고치면 까닭은 지운다.
 */
export function useItemForm(initial: ItemFields, save: ItemSave, onDone: () => void) {
  const [name, setName] = useState(initial.name);
  const [slotValue, setSlotValue] = useState(
    initial.slot === undefined ? "" : String(initial.slot),
  );
  const [memo, setMemo] = useState(initial.memo ?? "");
  const [error, setError] = useState<ItemError | null>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = save({ name, slot: slotOf(slotValue), memo });
    if (result.ok) onDone();
    else setError(result.reason);
  };
  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    setError(null);
  };
  return {
    fields: { name, slotValue, memo },
    setName: edit(setName),
    setSlotValue,
    setMemo: edit(setMemo),
    error,
    submit,
  };
}
