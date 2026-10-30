import { isWallBlocked } from "@/shared/lib/isWallBlocked";
import type { Box, Point } from "@/shared/types";
import type { DrawStep } from "./drawTapStep";

/**
 * 그리기 한 번(누르기·끌기·Enter)으로 생길 벽이 가구에 파고드는지: 다 그린 벽, 아니면 점이 늘어난 그리던 선.
 * 점을 지우거나 버리기만 하는 것(Backspace·Esc)은 막지 않는다 (그리던 선이 막혀도 물릴 수 있게).
 */
export function isDrawStepBlocked(
  draft: readonly Point[],
  step: DrawStep,
  boxes: readonly Box[],
): boolean {
  if (!step.wall && step.draft.length <= draft.length) return false;
  return isWallBlocked(step.wall ?? { points: step.draft, closed: false }, boxes);
}
