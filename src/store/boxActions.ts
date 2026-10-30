import { createId } from "@/shared/lib/createId";
import type { BoxSize } from "@/shared/lib/resizedBox";
import type { AppData, FurnitureType, Point } from "@/shared/types";
import { change, type GetCore, type SetCore } from "./change";
import { addBox, type NewBoxInput } from "./logic/addBox";
import { applyTypeHeight } from "./logic/applyTypeHeight";
import { changeBoxRows } from "./logic/changeBoxRows";
import { changeBoxType } from "./logic/changeBoxType";
import { moveBox } from "./logic/moveBox";
import { movedToNoSlot } from "./logic/movedToNoSlot";
import { renameBox, type BoxNameResult } from "./logic/renameBox";
import { resizeBox, type ResizeBoxResult } from "./logic/resizeBox";
import { rotateBox } from "./logic/rotateBox";

export type BoxActions = {
  addBox: (input: Omit<NewBoxInput, "id">) => string | null; // 새 가구 id, 현재 공간이 없으면 null
  moveBox: (id: string, center: Point) => void; // center = 가구 가운데 (cm, 2D)
  rotateBox: (id: string) => void; // 시계 방향 90도
  changeBoxType: (id: string, type: FurnitureType) => number; // 크기는 그대로, 칸 수·설치 높이는 종류 기본값. 칸 없음으로 옮긴 물건 수
  applyTypeHeight: (id: string) => void; // 그 종류의 기본 높이로
  renameBox: (id: string, name: string) => BoxNameResult; // 막히면 데이터는 그대로
  resizeBox: (id: string, size: BoxSize) => ResizeBoxResult; // 막히면 데이터는 그대로
  changeBoxRows: (id: string, rows: number) => number; // 1 ~ 8칸, 칸 수를 바꿀 수 있는 종류만. 칸 없음으로 옮긴 물건 수
  selectBox: (id: string | null) => void;
};

/** 가구 id의 칸을 바꾸는 update를 적용하고(되돌리기 한 번), 칸 없음으로 옮긴 물건 수를 돌려준다. */
function changeSlots(set: SetCore, get: GetCore, id: string, update: (data: AppData) => AppData) {
  const before = get().data;
  const after = update(before);
  set((state) => change(state, after));
  return movedToNoSlot(before, after, id);
}

/** 가구 액션 (현재 공간). 고르기 말고는 모두 되돌리기 한 번씩이다. 지우기는 boxRemoveActions. */
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
  changeBoxType: (id, type) => changeSlots(set, get, id, (data) => changeBoxType(data, id, type)),
  applyTypeHeight: (id) => set((state) => change(state, applyTypeHeight(state.data, id))),
  renameBox: (id, name) => {
    const result = renameBox(get().data, id, name);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  resizeBox: (id, size) => {
    const result = resizeBox(get().data, id, size);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  changeBoxRows: (id, rows) => changeSlots(set, get, id, (data) => changeBoxRows(data, id, rows)),
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
