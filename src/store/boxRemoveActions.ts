import { isStackedOn } from "@/shared/lib/isStackedOn";
import { change, type GetCore, type SetCore, type StoreCore } from "./change";
import { currentBox } from "./logic/currentBox";
import { keepSelection } from "./logic/keepSelection";
import { removeBox } from "./logic/removeBox";

export type BoxRemoveActions = {
  requestRemoveBox: (id: string) => void; // 물건이 들었거나 가구 위 가구가 있으면 삭제 확인을 열고, 아니면 바로 지운다
  // moveTo면 물건을 그 가구의 칸 없음으로 옮기고 지운다. withStacked면 가구 위 가구도 지우고, 아니면 내린다
  removeBox: (id: string, moveTo?: string, withStacked?: boolean) => void;
  cancelRemoveBox: () => void; // 삭제 확인을 닫는다
};

/** 가구를 지운 상태: 되돌리기 한 번(물건 옮기기까지), 고른 가구·삭제 확인을 비운다. */
function removed(state: StoreCore, id: string, moveTo?: string, withStacked?: boolean) {
  const data = removeBox(state.data, id, moveTo, withStacked);
  return { ...change(state, data), ui: { ...keepSelection(state.ui, data), removeAsk: null } };
}

/**
 * 가구 지우기 액션 (PRD 인수 조건 "가구 삭제"). 속성 패널 [삭제]·Delete 키·지우개·2D 지우기 버튼 모두
 * requestRemoveBox로 지워, 물건이 든 가구는 같이 지울지·다른 가구로 옮길지, 받침 가구는 가구 위 가구를
 * 내릴지·같이 지울지(T29-4) 먼저 묻는다.
 */
export const boxRemoveActions = (set: SetCore, get: GetCore): BoxRemoveActions => ({
  requestRemoveBox: (id) => {
    const box = currentBox(get().data, id);
    if (!box) return;
    const boxes = get().data.spaces.find((space) => space.boxes.includes(box))?.boxes ?? [];
    const hasStacked = boxes.some((other) => isStackedOn(boxes, other.id, id));
    if (box.items.length > 0 || hasStacked)
      set((state) => ({ ui: { ...state.ui, removeAsk: id } }));
    else set((state) => removed(state, id));
  },
  removeBox: (id, moveTo, withStacked) => set((state) => removed(state, id, moveTo, withStacked)),
  cancelRemoveBox: () => set((state) => ({ ui: { ...state.ui, removeAsk: null } })),
});
