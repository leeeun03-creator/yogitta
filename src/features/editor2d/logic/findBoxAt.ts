import { boxFootprint } from "@/shared/lib/boxFootprint";
import type { Box, Point } from "@/shared/types";

/** 누른 자리(cm)에 있는 가구. 겹쳐 있으면 위에 그려진(나중에 놓은) 가구, 없으면 null. */
export function findBoxAt(boxes: readonly Box[], point: Point): Box | null {
  for (let index = boxes.length - 1; index >= 0; index--) {
    const box = boxes[index];
    if (!box) continue;
    const size = boxFootprint(box);
    const isInside =
      Math.abs(point.x - box.x) <= size.w / 2 && Math.abs(point.y - box.z) <= size.d / 2;
    if (isInside) return box;
  }
  return null;
}
