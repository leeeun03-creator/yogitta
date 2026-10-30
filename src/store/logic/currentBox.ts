import type { AppData, Box } from "@/shared/types";

/** 현재 공간의 가구 하나 (없으면 undefined). */
export function currentBox(data: AppData, boxId: string): Box | undefined {
  const space = data.spaces.find((candidate) => candidate.id === data.currentSpaceId);
  return space?.boxes.find((candidate) => candidate.id === boxId);
}
