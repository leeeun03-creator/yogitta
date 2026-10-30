import type { AppData, Item } from "@/shared/types";
import { currentBox } from "./currentBox";
import { itemOf, type ItemResult, type NewItemInput } from "./itemOf";
import { updateBox } from "./updateBox";

const isSameItem = (a: Item, b: Item) =>
  a.name === b.name && a.slot === b.slot && a.memo === b.memo;

/**
 * 현재 공간의 가구에 든 물건 하나(input.id)의 이름·칸·메모를 고친다. 칸을 바꾸면 같은 가구의 그 칸으로 옮겨지고,
 * 넣은 순서는 그대로다. 바꾼 것이 없으면 data 그대로라 되돌리기 기록이 남지 않는다. 없는 가구·물건이면 그대로 둔다.
 */
export function updateItem(data: AppData, boxId: string, input: NewItemInput): ItemResult {
  const box = currentBox(data, boxId);
  const before = box?.items.find((item) => item.id === input.id);
  if (!box || !before) return { ok: true, data };
  const after = itemOf(box, input);
  if (typeof after === "string") return { ok: false, reason: after };
  if (isSameItem(before, after)) return { ok: true, data };
  const items = box.items.map((item) => (item.id === after.id ? after : item));
  return { ok: true, data: updateBox(data, boxId, (current) => ({ ...current, items })) };
}
