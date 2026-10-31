import type { Box } from "@/shared/types";
import { isStackedOn } from "./isStackedOn";

/**
 * box를 base 위에 올릴 수 있는지 (T29). 벽걸이는 벽에 거는 가구라 올리지도 받치지도 않고,
 * 자기 자신이나 자기 위에 올린 가구 위로는 올라가지 않는다 (받침 가구가 돌고 돌지 않게).
 */
export function canStackOn(boxes: readonly Box[], box: Box, base: Box): boolean {
  if (box.type === "wall" || base.type === "wall" || base.id === box.id) return false;
  return !isStackedOn(boxes, base.id, box.id);
}
