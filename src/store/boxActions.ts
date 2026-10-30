import { createId } from "@/shared/lib/createId";
import type { Point } from "@/shared/types";
import { change, type GetCore, type SetCore } from "./change";
import { addBox, type NewBoxInput } from "./logic/addBox";
import { keepSelection } from "./logic/keepSelection";
import { moveBox } from "./logic/moveBox";
import { removeBox } from "./logic/removeBox";
import { rotateBox } from "./logic/rotateBox";

export type BoxActions = {
  addBox: (input: Omit<NewBoxInput, "id">) => string | null; // 새 가구 id, 현재 공간이 없으면 null
  moveBox: (id: string, center: Point) => void; // center = 가구 가운데 (cm, 2D)
  rotateBox: (id: string) => void; // 시계 방향 90도
  removeBox: (id: string) => void;
  selectBox: (id: string | null) => void;
};

/** 가구 액션 (현재 공간). 더하기·옮기기·돌리기·지우기는 되돌리기 한 번씩이고, 지우면 고른 가구도 비운다. */
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
