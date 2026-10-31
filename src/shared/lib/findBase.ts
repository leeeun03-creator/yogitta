import type { Box, Point } from "@/shared/types";
import { canStackOn } from "./canStackOn";
import { heightSpan } from "./heightSpan";
import { isInsideFootprint } from "./isInsideFootprint";

/**
 * point(cm, 2D)가 윗면 안에 있는 가구 중 box를 올릴 수 있는 맨 위 가구 (box의 받침 가구가 될 가구, T29).
 * 책상 위 보관함 위로 끌면 보관함이다. 없으면 null.
 */
export function findBase(boxes: readonly Box[], box: Box, point: Point): Box | null {
  let found: Box | null = null;
  for (const candidate of boxes) {
    if (!isInsideFootprint(candidate, point) || !canStackOn(boxes, box, candidate)) continue;
    if (!found || heightSpan(candidate).top > heightSpan(found).top) found = candidate;
  }
  return found;
}
