import { ITEM_MEMO_MAX_LENGTH, ITEM_NAME_MAX_LENGTH } from "@/shared/constants/item";
import type { AppData, Box, Item } from "@/shared/types";

/** 물건을 넣거나 고치지 못하는 까닭: 빈 이름, 이름이 김, 메모가 김. */
export type ItemError = "emptyName" | "tooLong" | "memoTooLong";
export type ItemResult = { ok: true; data: AppData } | { ok: false; reason: ItemError };
/** 넣거나 고칠 물건: 이름(필수)·칸 번호·메모(선택). */
export type NewItemInput = { id: string; name: string; slot?: number; memo?: string };

const lengthOf = (text: string) => [...text].length; // 이모지도 한 글자로 센다

/** 칸 번호가 그 가구 칸 안이면 그대로, 아니면(없음·소수·칸 수 밖) 칸 없음(undefined). */
function slotIn(box: Pick<Box, "rows" | "cols">, slot: number | undefined): number | undefined {
  const isInside = slot !== undefined && Number.isInteger(slot) && slot >= 0;
  return isInside && slot < box.rows * box.cols ? slot : undefined;
}

/**
 * 입력을 검사해 가구(box)에 들어갈 물건을 만든다. 이름·메모 앞뒤 공백을 지우고 빈 메모는 뺀다.
 * 칸을 안 고르거나 칸 수 밖이면 칸 없음이다. 막히면 까닭을 돌려준다.
 */
export function itemOf(box: Box, input: NewItemInput): Item | ItemError {
  const name = input.name.trim();
  const memo = input.memo?.trim() ?? "";
  if (name === "") return "emptyName";
  if (lengthOf(name) > ITEM_NAME_MAX_LENGTH) return "tooLong";
  if (lengthOf(memo) > ITEM_MEMO_MAX_LENGTH) return "memoTooLong";
  const slot = slotIn(box, input.slot);
  return {
    id: input.id,
    name,
    ...(slot === undefined ? {} : { slot }),
    ...(memo === "" ? {} : { memo }),
  };
}
