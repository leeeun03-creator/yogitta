import type { AppMode, UiState } from "../uiState";

/**
 * 메인 화면 ↔ 편집 모드를 바꾼 화면 상태. 편집 모드는 늘 선택 도구·2D 평면도로 시작하고, 열려 있던 구역 입력칸과 고른 가구는 비운다
 * (다시 들어왔을 때 지우개 같은 도구가 켜져 있어 실수로 지우지 않게). 격자 스냅 켜짐·꺼짐은 그대로 둔다.
 */
export function switchMode(ui: UiState, mode: AppMode): UiState {
  return { ...ui, mode, view: "plan", tool: "select", roomFocus: null, selectedBoxId: null };
}
