import type { AppData } from "@/shared/types";
import type { UiState } from "../uiState";

/** 고른 가구가 현재 공간에 없으면(지웠거나 되돌려서 사라짐) 고른 가구를 비운 화면 상태. 있으면 원본 그대로다. */
export function keepSelection(ui: UiState, data: AppData): UiState {
  if (ui.selectedBoxId === null) return ui;
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  const exists = space?.boxes.some((box) => box.id === ui.selectedBoxId) ?? false;
  return exists ? ui : { ...ui, selectedBoxId: null };
}
