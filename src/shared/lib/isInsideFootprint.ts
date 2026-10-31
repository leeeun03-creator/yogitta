import type { Box, Point } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";

/** point(cm, 2D)가 가구가 바닥에서 차지하는 사각형 안(가장자리 포함)인지. */
export function isInsideFootprint(
  box: Pick<Box, "x" | "z" | "w" | "d" | "rotation">,
  point: Point,
) {
  const size = boxFootprint(box);
  return Math.abs(point.x - box.x) <= size.w / 2 && Math.abs(point.y - box.z) <= size.d / 2; // 2D y = 3D z
}
