import type { Box } from "@/shared/types";
import { isStackedOn } from "./isStackedOn";

/** id 가구 위에 올린 가구들 (두 층 포함, T29). 받침 가구가 아니면 빈 목록. */
export function stackedOn(boxes: readonly Box[], id: string): Box[] {
  return boxes.filter((box) => isStackedOn(boxes, box.id, id));
}
