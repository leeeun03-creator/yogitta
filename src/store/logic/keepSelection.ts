import type { AppData } from "@/shared/types";
import type { UiState } from "../uiState";
import { currentBox } from "./currentBox";

/**
 * 고른 가구·삭제 확인을 연 가구가 현재 공간에 없으면(지웠거나 되돌려서 사라짐) 그것을 비운 화면 상태.
 * 모두 있으면 원본 그대로다.
 */
export function keepSelection(ui: UiState, data: AppData): UiState {
  const keep = (id: string | null) => (id !== null && currentBox(data, id) ? id : null);
  const selectedBoxId = keep(ui.selectedBoxId);
  const removeAsk = keep(ui.removeAsk);
  if (selectedBoxId === ui.selectedBoxId && removeAsk === ui.removeAsk) return ui;
  return { ...ui, selectedBoxId, removeAsk };
}
