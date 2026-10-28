import { create } from "zustand";
import { DATA_VERSION } from "@/shared/constants/storage";
import { createId } from "@/shared/lib/createId";
import type { AppData, Wall } from "@/shared/types";
import { addSpace, type AddSpaceResult, type NewSpaceInput } from "./logic/addSpace";
import { addWall } from "./logic/addWall";
import { eraseSegment } from "./logic/eraseSegment";

export type AppMode = "main" | "edit";

/** 편집 모드의 그리기 도구. 가구 도구는 T6에서 더한다. */
export const DRAWING_TOOLS = ["select", "line", "polyline", "rect", "eraser"] as const;
export type DrawingTool = (typeof DRAWING_TOOLS)[number];

type AppState = {
  data: AppData; // 저장 대상 (T11에서 localStorage와 연결)
  ui: { mode: AppMode; tool: DrawingTool; snap: boolean }; // 화면 상태, 저장하지 않음
  addSpace: (input: NewSpaceInput) => AddSpaceResult;
  setMode: (mode: AppMode) => void;
  setTool: (tool: DrawingTool) => void;
  addWall: (wall: Omit<Wall, "id">) => void; // 현재 공간에 더한다
  eraseSegment: (wallId: string, segment: number) => void;
};

const INITIAL_DATA: AppData = { version: DATA_VERSION, spaces: [], currentSpaceId: null };

/** 앱 전체 데이터와 화면 상태. 데이터 변경은 여기 액션으로만 한다. */
export const useAppStore = create<AppState>()((set, get) => ({
  data: INITIAL_DATA,
  ui: { mode: "main", tool: "select", snap: true },
  addSpace: (input) => {
    const result = addSpace(get().data, input);
    if (result.ok) set({ data: result.data });
    return result;
  },
  setMode: (mode) => set((state) => ({ ui: { ...state.ui, mode } })),
  setTool: (tool) => set((state) => ({ ui: { ...state.ui, tool } })),
  addWall: (wall) =>
    set((state) => ({ data: addWall(state.data, { ...wall, id: createId("wall") }) })),
  eraseSegment: (wallId, segment) =>
    set((state) => ({ data: eraseSegment(state.data, { wallId, segment }, createId("wall")) })),
}));
