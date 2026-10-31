import { isInsideFootprint } from "@/shared/lib/isInsideFootprint";
import type { Box, Point } from "@/shared/types";
import { stackOrder } from "./stackOrder";

/**
 * 누른 자리(cm)에 있는 가구. 겹쳐 있으면 위에 보이는 가구(높이 놓인 것, 같은 높이면 나중에 놓은 것),
 * 없으면 null.
 */
export function findBoxAt(boxes: readonly Box[], point: Point): Box | null {
  const ordered = stackOrder(boxes);
  for (let index = ordered.length - 1; index >= 0; index--) {
    const box = ordered[index];
    if (box && isInsideFootprint(box, point)) return box;
  }
  return null;
}
