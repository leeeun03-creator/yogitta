import { change, type GetCore, type SetCore, type StoreCore } from "./change";
import { currentBox } from "./logic/currentBox";
import { keepSelection } from "./logic/keepSelection";
import { removeBox } from "./logic/removeBox";

export type BoxRemoveActions = {
  requestRemoveBox: (id: string) => void; // 물건이 든 가구면 삭제 확인을 열고, 빈 가구면 바로 지운다
  removeBox: (id: string, moveTo?: string) => void; // moveTo면 물건을 그 가구의 칸 없음으로 옮기고 지운다
  cancelRemoveBox: () => void; // 삭제 확인을 닫는다
};

/** 가구를 지운 상태: 되돌리기 한 번(물건 옮기기까지), 고른 가구·삭제 확인을 비운다. */
function removed(state: StoreCore, id: string, moveTo?: string) {
  const data = removeBox(state.data, id, moveTo);
  return { ...change(state, data), ui: { ...keepSelection(state.ui, data), removeAsk: null } };
}

/**
 * 가구 지우기 액션 (PRD 인수 조건 "가구 삭제"). 속성 패널 [삭제]·Delete 키·지우개·2D 지우기 버튼 모두
 * requestRemoveBox로 지워, 물건이 든 가구는 같이 지울지·다른 가구로 옮길지 먼저 묻는다.
 */
export const boxRemoveActions = (set: SetCore, get: GetCore): BoxRemoveActions => ({
  requestRemoveBox: (id) => {
    const box = currentBox(get().data, id);
    if (!box) return;
    if (box.items.length > 0) set((state) => ({ ui: { ...state.ui, removeAsk: id } }));
    else set((state) => removed(state, id));
  },
  removeBox: (id, moveTo) => set((state) => removed(state, id, moveTo)),
  cancelRemoveBox: () => set((state) => ({ ui: { ...state.ui, removeAsk: null } })),
});
