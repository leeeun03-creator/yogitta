import { create } from "zustand";
import { DATA_VERSION } from "@/shared/constants/storage";
import type { AppData } from "@/shared/types";
import { addSpace, type AddSpaceResult, type NewSpaceInput } from "./logic/addSpace";

export type AppMode = "main" | "edit";

type AppState = {
  data: AppData; // 저장 대상 (T11에서 localStorage와 연결)
  ui: { mode: AppMode }; // 화면 상태, 저장하지 않음
  addSpace: (input: NewSpaceInput) => AddSpaceResult;
  setMode: (mode: AppMode) => void;
};

const INITIAL_DATA: AppData = { version: DATA_VERSION, spaces: [], currentSpaceId: null };

/** 앱 전체 데이터와 화면 상태. 데이터 변경은 여기 액션으로만 한다. */
export const useAppStore = create<AppState>()((set, get) => ({
  data: INITIAL_DATA,
  ui: { mode: "main" },
  addSpace: (input) => {
    const result = addSpace(get().data, input);
    if (result.ok) set({ data: result.data });
    return result;
  },
  setMode: (mode) => set((state) => ({ ui: { ...state.ui, mode } })),
}));
