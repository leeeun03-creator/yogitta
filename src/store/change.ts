import { UNDO_LIMIT } from "@/shared/constants/history";
import type { AppData } from "@/shared/types";
import { recordHistory, type History } from "./logic/recordHistory";
import type { UiState } from "./uiState";

/** store 상태 중 액션이 바꾸는 부분: 데이터·화면 상태·되돌리기 기록. 액션을 여러 파일로 나눠도 같은 모양을 쓴다. */
export type StoreCore = { data: AppData; ui: UiState; history: History };
export type SetCore = (update: (state: StoreCore) => Partial<StoreCore>) => void;
export type GetCore = () => StoreCore;

/** 데이터를 바꾸고 바뀌기 전을 되돌리기 기록에 남긴다. 바뀌지 않았으면 기록도 그대로다. */
export function change(state: StoreCore, data: AppData) {
  return { data, history: recordHistory(state.history, state.data, data, UNDO_LIMIT) };
}
