import type { Box } from "@/shared/types";

/** 가구 위 가구의 받침 가구 (T29). 바닥 가구이거나 받침 가구를 찾을 수 없으면 undefined. */
export function baseOf(box: Pick<Box, "parentId">, boxes: readonly Box[]): Box | undefined {
  return box.parentId === undefined ? undefined : boxes.find((other) => other.id === box.parentId);
}
