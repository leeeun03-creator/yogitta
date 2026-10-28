import { create } from "zustand";
import { DATA_VERSION } from "@/shared/constants/storage";
import type { AppData } from "@/shared/types";
import { addSpace, type AddSpaceResult, type NewSpaceInput } from "./logic/addSpace";

export type AppMode = "main" | "edit";

/** 편집 모드의 그리기 도구. 가구 도구는 T6에서 더한다. */
export const DRAWING_TOOLS = ["select", "line", "polyline", "rect", "eraser"] as const;
export type DrawingTool = (typeof DRAWING_TOOLS)[number];

type AppState = {
  data: AppData; // 저장 대상 (T11에서 localStorage와 연결)
  ui: { mode: AppMode; tool: DrawingTool }; // 화면 상태, 저장하지 않음
  addSpace: (input: NewSpaceInput) => AddSpaceResult;
  setMode: (mode: AppMode) => void;
  setTool: (tool: DrawingTool) => void;
};

const INITIAL_DATA: AppData = { version: DATA_VERSION, spaces: [], currentSpaceId: null };

/** 앱 전체 데이터와 화면 상태. 데이터 변경은 여기 액션으로만 한다. */
export const useAppStore = create<AppState>()((set, get) => ({
  data: INITIAL_DATA,
  ui: { mode: "main", tool: "select" },
  addSpace: (input) => {
    const result = addSpace(get().data, input);
    if (result.ok) set({ data: result.data });
    return result;
  },
  setMode: (mode) => set((state) => ({ ui: { ...state.ui, mode } })),
  setTool: (tool) => set((state) => ({ ui: { ...state.ui, tool } })),
}));
