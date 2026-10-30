import type { AppData, Item } from "@/shared/types";
import { currentBox } from "./currentBox";
import { itemOf, type ItemResult, type NewItemInput } from "./itemOf";
import { updateBox } from "./updateBox";

const isSameItem = (a: Item, b: Item) =>
  a.name === b.name && a.slot === b.slot && a.memo === b.memo;

/** 물건(item)을 가구 boxId에서 빼서 가구 toBoxId의 물건 맨 뒤에 넣는다. */
function moveToBox(data: AppData, boxId: string, toBoxId: string, item: Item): AppData {
  const removed = updateBox(data, boxId, (box) => ({
    ...box,
    items: box.items.filter((candidate) => candidate.id !== item.id),
  }));
  return updateBox(removed, toBoxId, (box) => ({ ...box, items: [...box.items, item] }));
}

/**
 * 현재 공간의 가구 boxId에 든 물건 하나(input.id)의 이름·칸·메모를 고친다. 칸을 바꾸면 그 칸으로 옮겨지고,
 * 넣은 순서는 그대로다. toBoxId가 다른 가구면 그 가구의 칸(칸 번호는 그 가구 기준)으로 옮겨 맨 뒤에 넣는다.
 * 바꾼 것이 없으면 data 그대로라 되돌리기 기록이 남지 않는다. 없는 가구·물건이면 그대로 둔다.
 */
export function updateItem(
  data: AppData,
  boxId: string,
  input: NewItemInput,
  toBoxId = boxId,
): ItemResult {
  const box = currentBox(data, boxId);
  const target = currentBox(data, toBoxId);
  const before = box?.items.find((item) => item.id === input.id);
  if (!box || !target || !before) return { ok: true, data };
  const after = itemOf(target, input);
  if (typeof after === "string") return { ok: false, reason: after };
  if (target !== box) return { ok: true, data: moveToBox(data, boxId, toBoxId, after) };
  if (isSameItem(before, after)) return { ok: true, data };
  const items = box.items.map((item) => (item.id === after.id ? after : item));
  return { ok: true, data: updateBox(data, boxId, (current) => ({ ...current, items })) };
}
