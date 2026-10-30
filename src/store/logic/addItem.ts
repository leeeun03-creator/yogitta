import type { AppData } from "@/shared/types";
import { currentBox } from "./currentBox";
import { itemOf, type ItemResult, type NewItemInput } from "./itemOf";
import { updateBox } from "./updateBox";

/**
 * 현재 공간의 가구 하나에 물건을 넣는다. 칸을 안 고르거나 칸 수 밖이면 칸 없음에 넣는다.
 * 같은 칸에 같은 이름도 된다(실제로 두 개일 수 있어서). 없는 가구면 그대로 둔다.
 */
export function addItem(data: AppData, boxId: string, input: NewItemInput): ItemResult {
  const box = currentBox(data, boxId);
  if (!box) return { ok: true, data };
  const item = itemOf(box, input);
  if (typeof item === "string") return { ok: false, reason: item };
  return {
    ok: true,
    data: updateBox(data, boxId, (current) => ({ ...current, items: [...current.items, item] })),
  };
}
