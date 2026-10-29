import { create } from "zustand";
import { UNDO_LIMIT } from "@/shared/constants/history";
import { DATA_VERSION } from "@/shared/constants/storage";
import { createId } from "@/shared/lib/createId";
import type { AppData, Point, Wall } from "@/shared/types";
import { addRoom, type RoomResult } from "./logic/addRoom";
import { addRoomLine } from "./logic/addRoomLine";
import { addSpace, type AddSpaceResult, type NewSpaceInput } from "./logic/addSpace";
import { addWall } from "./logic/addWall";
import { eraseSegment } from "./logic/eraseSegment";
import { moveHistory, type HistoryDirection } from "./logic/moveHistory";
import { EMPTY_HISTORY, recordHistory, type History } from "./logic/recordHistory";
import { removeRoom } from "./logic/removeRoom";
import { removeRoomLine } from "./logic/removeRoomLine";
import { renameRoom } from "./logic/renameRoom";
import { switchMode } from "./logic/switchMode";
import type { AppMode, DrawingTool, EditView, RoomFocus, UiState } from "./uiState";

export type { AppMode, DrawingTool, EditView, RoomFocus } from "./uiState";
export { DRAWING_TOOLS } from "./uiState";
export type { HistoryDirection, RoomResult };
export type { RoomNameError } from "./logic/checkRoomName";

type AppState = {
  data: AppData; // 저장 대상 (T11에서 localStorage와 연결)
  ui: UiState; // 화면 상태, 저장하지 않음
  history: History; // 되돌리기 기록, 저장하지 않음
  addSpace: (input: NewSpaceInput) => AddSpaceResult;
  setMode: (mode: AppMode) => void;
  setView: (view: EditView) => void;
  setTool: (tool: DrawingTool) => void;
  setSnap: (snap: boolean) => void;
  setRoomFocus: (focus: RoomFocus | null) => void;
  addWall: (wall: Omit<Wall, "id">) => void; // 현재 공간에 더한다
  eraseSegment: (wallId: string, segment: number) => void;
  addRoom: (name: string, at?: Point) => RoomResult; // 현재 공간에 구역을 더한다 (at = 구역 기준점)
  renameRoom: (from: string, to: string) => RoomResult;
  removeRoom: (name: string) => void;
  addRoomLine: (points: Point[]) => void; // 현재 공간에 구역 선을 더한다
  removeRoomLine: (id: string) => void;
  undo: () => void;
  redo: () => void;
};

const INITIAL_DATA: AppData = { version: DATA_VERSION, spaces: [], currentSpaceId: null };

/** 데이터를 바꾸고 바뀌기 전을 되돌리기 기록에 남긴다. 바뀌지 않았으면 기록도 그대로다. */
const change = (state: AppState, data: AppData) => ({
  data,
  history: recordHistory(state.history, state.data, data, UNDO_LIMIT),
});

/** 되돌리기·다시하기. 더 갈 곳이 없으면 아무것도 바꾸지 않는다. */
const move = (state: AppState, direction: HistoryDirection) =>
  moveHistory(state.history, state.data, direction) ?? {};

/** 앱 전체 데이터와 화면 상태. 데이터 변경은 여기 액션으로만 한다. */
export const useAppStore = create<AppState>()((set, get) => ({
  data: INITIAL_DATA,
  ui: { mode: "main", view: "plan", tool: "select", snap: true, roomFocus: null },
  history: EMPTY_HISTORY,
  // 공간 만들기는 되돌리지 않고 기록을 비운다 (되돌려서 첫 실행 화면으로 가거나, 옛 기록이 새 공간을 지우지 않게).
  // 새 공간은 벽부터 그리도록 편집 모드로 연다
  addSpace: (input) => {
    const result = addSpace(get().data, input);
    if (result.ok)
      set((state) => ({
        data: result.data,
        history: EMPTY_HISTORY,
        ui: switchMode(state.ui, "edit"),
      }));
    return result;
  },
  setMode: (mode) => set((state) => ({ ui: switchMode(state.ui, mode) })),
  setView: (view) => set((state) => ({ ui: { ...state.ui, view } })),
  // 도구를 바꾸면 열려 있던 구역 입력칸은 닫는다 (다른 도구로 누른 자리와 헷갈리지 않게)
  setTool: (tool) => set((state) => ({ ui: { ...state.ui, tool, roomFocus: null } })),
  setSnap: (snap) => set((state) => ({ ui: { ...state.ui, snap } })),
  setRoomFocus: (roomFocus) => set((state) => ({ ui: { ...state.ui, roomFocus } })),
  addWall: (wall) =>
    set((state) => change(state, addWall(state.data, { ...wall, id: createId("wall") }))),
  eraseSegment: (wallId, segment) =>
    set((state) => change(state, eraseSegment(state.data, { wallId, segment }, createId("wall")))),
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
