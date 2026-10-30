import { createId } from "@/shared/lib/createId";
import type { FurnitureType, Point } from "@/shared/types";
import { change, type GetCore, type SetCore } from "./change";
import { addBox, type NewBoxInput } from "./logic/addBox";
import { applyTypeHeight } from "./logic/applyTypeHeight";
import { changeBoxType } from "./logic/changeBoxType";
import { keepSelection } from "./logic/keepSelection";
import { moveBox } from "./logic/moveBox";
import { removeBox } from "./logic/removeBox";
import { renameBox, type BoxNameResult } from "./logic/renameBox";
import { rotateBox } from "./logic/rotateBox";

export type BoxActions = {
  addBox: (input: Omit<NewBoxInput, "id">) => string | null; // 새 가구 id, 현재 공간이 없으면 null
  moveBox: (id: string, center: Point) => void; // center = 가구 가운데 (cm, 2D)
  rotateBox: (id: string) => void; // 시계 방향 90도
  changeBoxType: (id: string, type: FurnitureType) => void; // 크기는 그대로, 칸 수·설치 높이는 종류 기본값
  applyTypeHeight: (id: string) => void; // 그 종류의 기본 높이로
  renameBox: (id: string, name: string) => BoxNameResult; // 막히면 데이터는 그대로
  removeBox: (id: string) => void;
  selectBox: (id: string | null) => void;
};

/** 가구 액션 (현재 공간). 고르기 말고는 모두 되돌리기 한 번씩이고, 지우면 고른 가구도 비운다. */
export const boxActions = (set: SetCore, get: GetCore): BoxActions => ({
  addBox: (input) => {
    const id = createId("box");
    const data = addBox(get().data, { ...input, id });
    if (data === get().data) return null;
    set((state) => change(state, data));
    return id;
  },
  moveBox: (id, center) => set((state) => change(state, moveBox(state.data, id, center))),
  rotateBox: (id) => set((state) => change(state, rotateBox(state.data, id))),
  changeBoxType: (id, type) => set((state) => change(state, changeBoxType(state.data, id, type))),
  applyTypeHeight: (id) => set((state) => change(state, applyTypeHeight(state.data, id))),
  renameBox: (id, name) => {
    const result = renameBox(get().data, id, name);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  removeBox: (id) =>
    set((state) => {
      const data = removeBox(state.data, id);
      return { ...change(state, data), ui: keepSelection(state.ui, data) };
    }),
  // 가구를 고르면 열려 있던 구역 입력칸은 닫는다 (고른 것이 둘이 되지 않게)
  selectBox: (selectedBoxId) =>
    set((state) => ({
      ui: {
        ...state.ui,
        selectedBoxId,
        roomFocus: selectedBoxId === null ? state.ui.roomFocus : null,
      },
    })),
});
