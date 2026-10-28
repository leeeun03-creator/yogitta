import type { Point } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import type { DrawStep } from "./drawTapStep";
import { finishPolyline } from "./nextPolylineDraft";

/** 그리는 중에 누른 키: Esc 취소, 연속선은 Enter 끝내기·Backspace 마지막 점 취소. 관계없는 키는 null. */
export function drawKeyStep(
  tool: DrawingTool,
  draft: readonly Point[],
  key: string,
): DrawStep | null {
  if (draft.length === 0) return null;
  if (key === "Escape") return { draft: [] };
  if (tool !== "polyline") return null;
  if (key === "Backspace") return { draft: draft.slice(0, -1) };
  if (key === "Enter") {
    const step = finishPolyline(draft);
    return step.wall ? { draft: step.draft, wall: { tool, ...step.wall } } : { draft: step.draft };
  }
  return null;
}
