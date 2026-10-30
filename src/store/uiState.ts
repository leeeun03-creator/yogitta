import type { Point } from "@/shared/types";

/** 지금 보는 화면: 메인 화면(main) 또는 편집 모드(edit). */
export type AppMode = "main" | "edit";

/** 편집 모드의 그리기 도구. 가구 도구는 T6에서 더한다. */
export const DRAWING_TOOLS = ["select", "line", "polyline", "rect", "roomLine", "eraser"] as const;
export type DrawingTool = (typeof DRAWING_TOOLS)[number];

/**
 * 구역 입력칸이 열린 곳: 고른 구역 이름 바꾸기(rename, 하단 칩) 또는 이름 없는 구획을 누른 자리(new, cm)에서 새 구역 만들기.
 */
export type RoomFocus = { type: "rename"; room: string } | { type: "new"; at: Point };

/** 편집 모드에서 보는 것: 2D 평면도(plan) 또는 3D 미리보기(preview). */
export type EditView = "plan" | "preview";

/** 화면 상태. 저장하지 않는다. */
export type UiState = {
  mode: AppMode;
  view: EditView;
  tool: DrawingTool;
  snap: boolean;
  roomFocus: RoomFocus | null;
  selectedBoxId: string | null; // 고른 가구 (현재 공간)
};
