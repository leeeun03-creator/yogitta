import type { Point } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import { drawTapStep, type DrawStep } from "./drawTapStep";

/**
 * 직선·연속선을 끌어서 그렸을 때 그리던 점과 새 벽.
 * 그리던 점이 없으면 누른 점(start)에서 시작하고, 뗀 점(end)은 한 번 누른 것처럼 더한다.
 * 빈 상태에서 시작해 선분을 하나도 못 만들면(길이 0) 아무 점도 남기지 않는다.
 */
export function drawDragStep(
  tool: DrawingTool,
  draft: readonly Point[],
  start: Point,
  end: Point,
  closeRadius: number,
): DrawStep {
  const begun = draft.length > 0 ? draft : drawTapStep(tool, draft, start, closeRadius).draft;
  const step = drawTapStep(tool, begun, end, closeRadius);
  const hasSegment = step.wall !== undefined || step.draft.length >= 2;
  if (draft.length === 0 && !hasSegment) return { draft: [] };
  return step;
}
