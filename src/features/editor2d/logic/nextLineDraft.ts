import type { Point } from "@/shared/types";

export type LineStep = { draft: Point[]; wall?: [Point, Point] };

/** 직선 도구에서 한 번 눌렀을 때: 첫 점이면 시작, 둘째 점이면 벽이 된다. 같은 자리(길이 0)는 무시한다. */
export function nextLineDraft(draft: readonly Point[], point: Point): LineStep {
  const start = draft[0];
  if (!start) return { draft: [point] };
  if (start.x === point.x && start.y === point.y) return { draft: [start] };
  return { draft: [], wall: [start, point] };
}
