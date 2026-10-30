import { createId } from "@/shared/lib/createId";
import { change, type GetCore, type SetCore } from "./change";
import { addItem } from "./logic/addItem";
import type { ItemResult, NewItemInput } from "./logic/itemOf";
import { removeItem } from "./logic/removeItem";
import { updateItem } from "./logic/updateItem";

export type ItemActions = {
  addItem: (boxId: string, input: Omit<NewItemInput, "id">) => ItemResult; // 막히면 데이터는 그대로
  updateItem: (boxId: string, input: NewItemInput) => ItemResult; // input.id인 물건을 고친다
  removeItem: (boxId: string, itemId: string) => void;
};

/** 물건 액션 (현재 공간의 가구). 넣기·고치기·빼기는 되돌리기 한 번씩이다. */
export const itemActions = (set: SetCore, get: GetCore): ItemActions => ({
  addItem: (boxId, input) => {
    const result = addItem(get().data, boxId, { ...input, id: createId("item") });
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  updateItem: (boxId, input) => {
    const result = updateItem(get().data, boxId, input);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  removeItem: (boxId, itemId) =>
    set((state) => change(state, removeItem(state.data, boxId, itemId))),
});
