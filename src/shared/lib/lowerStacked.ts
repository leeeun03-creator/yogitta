import type { Box } from "@/shared/types";
import { isStackedOn } from "./isStackedOn";

/**
 * 받침 가구 base가 빠지면(지우거나 벽걸이로 바꿈) 그 위에 올린 가구(두 층 포함)를 base 높이만큼 내린 가구 목록 (T29).
 * 바로 위 가구는 base가 놓였던 곳(base의 받침 가구, 없으면 바닥)에 놓인다. base는 바뀌기 전 가구를 준다.
 */
export function lowerStacked(boxes: readonly Box[], base: Box): Box[] {
  return boxes.map((box) => {
    if (!isStackedOn(boxes, box.id, base.id)) return box;
    const lowered: Box = { ...box, elevation: box.elevation - base.h };
    if (box.parentId !== base.id) return lowered;
    if (base.parentId === undefined) delete lowered.parentId;
    else lowered.parentId = base.parentId;
    return lowered;
  });
}
