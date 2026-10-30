import { ITEM_MEMO_MAX_LENGTH, ITEM_NAME_MAX_LENGTH } from "@/shared/constants/item";
import type { AppData, Box, Item } from "@/shared/types";
import { updateBox } from "./updateBox";

/** 물건을 못 넣는 까닭: 빈 이름, 이름이 김, 메모가 김. */
export type ItemError = "emptyName" | "tooLong" | "memoTooLong";
export type ItemResult = { ok: true; data: AppData } | { ok: false; reason: ItemError };
/** 넣을 물건: 이름(필수)·칸 번호·메모(선택). */
export type NewItemInput = { id: string; name: string; slot?: number; memo?: string };

const lengthOf = (text: string) => [...text].length; // 이모지도 한 글자로 센다

/** 칸 번호가 그 가구 칸 안이면 그대로, 아니면(없음·소수·칸 수 밖) 칸 없음(undefined). */
function slotIn(box: Pick<Box, "rows" | "cols">, slot: number | undefined): number | undefined {
  const isInside = slot !== undefined && Number.isInteger(slot) && slot >= 0;
  return isInside && slot < box.rows * box.cols ? slot : undefined;
}

/** 입력을 검사해 넣을 물건을 만든다. 이름·메모 앞뒤 공백을 지우고 빈 메모는 뺀다. */
function itemOf(box: Box, input: NewItemInput): Item | ItemError {
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

/**
 * 현재 공간의 가구 하나에 물건을 넣는다. 칸을 안 고르거나 칸 수 밖이면 칸 없음에 넣는다.
 * 같은 칸에 같은 이름도 된다(실제로 두 개일 수 있어서). 없는 가구면 그대로 둔다.
 */
export function addItem(data: AppData, boxId: string, input: NewItemInput): ItemResult {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  const box = space?.boxes.find((candidate) => candidate.id === boxId);
  if (!box) return { ok: true, data };
  const item = itemOf(box, input);
  if (typeof item === "string") return { ok: false, reason: item };
  return {
    ok: true,
    data: updateBox(data, boxId, (current) => ({ ...current, items: [...current.items, item] })),
  };
}
