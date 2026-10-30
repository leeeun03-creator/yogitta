import { create, type StoreApi } from "zustand";
import { DATA_VERSION } from "@/shared/constants/storage";
import { createId } from "@/shared/lib/createId";
import type { AppData, Point } from "@/shared/types";
import { boxActions, type BoxActions } from "./boxActions";
import { boxRemoveActions, type BoxRemoveActions } from "./boxRemoveActions";
import { change } from "./change";
import { itemActions, type ItemActions } from "./itemActions";
import { addRoom, type RoomResult } from "./logic/addRoom";
import { addRoomLine } from "./logic/addRoomLine";
import { addSpace, type AddSpaceResult, type NewSpaceInput } from "./logic/addSpace";
import { keepSelection } from "./logic/keepSelection";
import { moveHistory, type HistoryDirection } from "./logic/moveHistory";
import { EMPTY_HISTORY, type History } from "./logic/recordHistory";
import { removeRoom } from "./logic/removeRoom";
import { removeRoomLine } from "./logic/removeRoomLine";
import { removeSpace } from "./logic/removeSpace";
import { renameRoom } from "./logic/renameRoom";
import { renameSpace } from "./logic/renameSpace";
import type { SpaceResult } from "./logic/spaceNameError";
import { switchSpace } from "./logic/switchSpace";
import { switchMode } from "./logic/switchMode";
import type { AppMode, DrawingTool, EditView, RoomFocus, UiState } from "./uiState";
import { wallActions, type WallActions } from "./wallActions";

export type { AppMode, DrawingTool, EditView, RoomFocus } from "./uiState";
export { DRAWING_TOOLS } from "./uiState";
export type { HistoryDirection, RoomResult, SpaceResult };
export type { ItemError } from "./logic/itemOf";
export type { RoomNameError } from "./logic/checkRoomName";
export type { SpaceNameError } from "./logic/spaceNameError";

type AppState = BoxActions &
  BoxRemoveActions &
  WallActions &
  ItemActions & {
    data: AppData; // 저장 대상 (T11에서 localStorage와 연결)
    ui: UiState; // 화면 상태, 저장하지 않음
    history: History; // 되돌리기 기록, 저장하지 않음
    addSpace: (input: NewSpaceInput) => AddSpaceResult;
    switchSpace: (id: string) => void;
    renameSpace: (id: string, name: string) => SpaceResult;
    removeSpace: (id: string) => void; // 벽·가구·물건 모두 지운다 (확인은 화면에서)
    setMode: (mode: AppMode) => void;
    setView: (view: EditView) => void;
    setTool: (tool: DrawingTool) => void;
    setSnap: (snap: boolean) => void;
    setRoomFocus: (focus: RoomFocus | null) => void;
    addRoom: (name: string, at?: Point) => RoomResult; // 현재 공간에 구역을 더한다 (at = 구역 기준점)
    renameRoom: (from: string, to: string) => RoomResult;
    removeRoom: (name: string) => void;
    addRoomLine: (points: Point[]) => void; // 현재 공간에 구역 선을 더한다
    removeRoomLine: (id: string) => void;
    undo: () => void;
    redo: () => void;
  };

const INITIAL_DATA: AppData = { version: DATA_VERSION, spaces: [], currentSpaceId: null };

/** 되돌리기·다시하기. 더 갈 곳이 없으면 아무것도 바꾸지 않는다. 고른 가구가 사라지면 고른 가구도 비운다. */
const move = (state: AppState, direction: HistoryDirection) => {
  const moved = moveHistory(state.history, state.data, direction);
  return moved ? { ...moved, ui: keepSelection(state.ui, moved.data) } : {};
};

type SpaceActions = Pick<AppState, "addSpace" | "switchSpace" | "renameSpace" | "removeSpace">;
type SetState = StoreApi<AppState>["setState"];
type GetState = StoreApi<AppState>["getState"];

/** 공간 하나를 데이터·되돌리기 기록과 함께 바꾼다. 화면 상태는 모드만 남기고 처음으로 돌린다 (다른 공간의 구역 입력칸 등). */
const changeSpace = (state: AppState, data: AppData, mode = state.ui.mode) => ({
  data,
  history: EMPTY_HISTORY,
  ui: switchMode(state.ui, mode),
});

/**
 * 공간 단위 액션 (만들기·바꾸기·이름 바꾸기·삭제). 되돌리지 않고 되돌리기 기록을 비운다
 * (되돌려서 다른 공간이 바뀌거나 지운 공간이 살아나지 않게). 새 공간은 벽부터 그리도록 편집 모드로 연다.
 */
const spaceActions = (set: SetState, get: GetState): SpaceActions => ({
  addSpace: (input) => {
    const result = addSpace(get().data, input);
    if (result.ok) set((state) => changeSpace(state, result.data, "edit"));
    return result;
  },
  switchSpace: (id) => {
    const data = switchSpace(get().data, id);
    if (data !== get().data) set((state) => changeSpace(state, data));
  },
  renameSpace: (id, name) => {
    const result = renameSpace(get().data, id, name);
    if (result.ok && result.data !== get().data) set((state) => changeSpace(state, result.data));
    return result;
  },
  removeSpace: (id) => {
    const data = removeSpace(get().data, id);
    if (data !== get().data) set((state) => changeSpace(state, data, "main"));
  },
});

type UiActions = Pick<AppState, "setMode" | "setView" | "setTool" | "setSnap" | "setRoomFocus">;

/** 화면 상태(ui)만 바꾸는 액션. 데이터·되돌리기 기록은 건드리지 않는다. */
const uiActions = (set: SetState): UiActions => ({
  setMode: (mode) => set((state) => ({ ui: switchMode(state.ui, mode) })),
  setView: (view) => set((state) => ({ ui: { ...state.ui, view } })),
  // 도구를 바꾸면 열려 있던 구역 입력칸은 닫는다 (다른 도구로 누른 자리와 헷갈리지 않게).
  // 가구는 선택 도구로만 고르므로 다른 도구로 바꾸면 고른 가구도 비운다
  setTool: (tool) =>
    set((state) => ({
      ui: {
        ...state.ui,
        tool,
        roomFocus: null,
        selectedBoxId: tool === "select" ? state.ui.selectedBoxId : null,
      },
    })),
  setSnap: (snap) => set((state) => ({ ui: { ...state.ui, snap } })),
  setRoomFocus: (roomFocus) => set((state) => ({ ui: { ...state.ui, roomFocus } })),
});

/** 앱 전체 데이터와 화면 상태. 데이터 변경은 여기 액션으로만 한다. */
export const useAppStore = create<AppState>()((set, get) => ({
  data: INITIAL_DATA,
  ui: {
    mode: "main",
    view: "plan",
    tool: "select",
    snap: true,
    roomFocus: null,
    selectedBoxId: null,
    removeAsk: null,
  },
  history: EMPTY_HISTORY,
  ...spaceActions(set, get),
  ...uiActions(set),
  ...boxActions(set, get),
  ...boxRemoveActions(set, get),
  ...wallActions(set, get),
  ...itemActions(set, get),
  addRoom: (name, at) => {
    const result = addRoom(get().data, name, at);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  renameRoom: (from, to) => {
    const result = renameRoom(get().data, from, to);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  removeRoom: (name) => set((state) => change(state, removeRoom(state.data, name))),
  addRoomLine: (points) =>
    set((state) => change(state, addRoomLine(state.data, { id: createId("roomLine"), points }))),
  removeRoomLine: (id) => set((state) => change(state, removeRoomLine(state.data, id))),
  undo: () => set((state) => move(state, "undo")),
  redo: () => set((state) => move(state, "redo")),
}));
