import type { Point, Wall } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import { nextLineDraft } from "./nextLineDraft";
import { nextPolylineDraft } from "./nextPolylineDraft";

type NewWall = Omit<Wall, "id">;
export type DrawStep = { draft: Point[]; wall?: NewWall };

/** 그리기 도구로 한 번 눌렀을 때 그리던 점과 새 벽. 누르기로 그리지 않는 도구는 그대로 둔다. */
export function drawTapStep(
  tool: DrawingTool,
  draft: readonly Point[],
  point: Point,
  closeRadius: number,
): DrawStep {
  if (tool === "line") {
    const step = nextLineDraft(draft, point);
    return step.wall
      ? { draft: step.draft, wall: { tool, points: step.wall, closed: false } }
      : { draft: step.draft };
  }
  if (tool === "polyline") {
    const step = nextPolylineDraft(draft, point, closeRadius);
    return step.wall ? { draft: step.draft, wall: { tool, ...step.wall } } : { draft: step.draft };
  }
  return { draft: [...draft] };
}
