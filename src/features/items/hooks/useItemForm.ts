import { useState, type FormEvent } from "react";
import { useAppStore, type ItemError } from "@/store/useAppStore";

/** 칸 고르기 값: 칸 번호 글자, 빈 글자는 칸 없음. */
const slotOf = (value: string) => (value === "" ? undefined : Number(value));

/**
 * 물건 넣기 입력(이름·칸·메모)과 막힌 까닭. slot은 처음 골라 둘 칸(빈 칸의 [+ 추가]), 없으면 칸 없음이다.
 * submit은 넣고 onDone을 부르고, 막히면 까닭만 남긴다. 글자를 고치면 까닭은 지운다.
 */
export function useItemForm(boxId: string, slot: number | undefined, onDone: () => void) {
  const addItem = useAppStore((state) => state.addItem);
  const [name, setName] = useState("");
  const [slotValue, setSlotValue] = useState(slot === undefined ? "" : String(slot));
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<ItemError | null>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = addItem(boxId, { name, slot: slotOf(slotValue), memo });
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
