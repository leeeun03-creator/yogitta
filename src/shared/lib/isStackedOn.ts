import type { Box } from "@/shared/types";

/**
 * id 가구가 baseId 가구 위에 (바로, 또는 다른 가구 위 가구를 거쳐) 올라가 있는지. 받침 가구를 따라 내려가며 본다.
 * 깨진 데이터에서 받침 가구가 서로를 가리켜도 가구 수만큼만 따라가고 멈춘다.
 */
export function isStackedOn(boxes: readonly Box[], id: string, baseId: string): boolean {
  const parentOf = (childId: string) => boxes.find((box) => box.id === childId)?.parentId;
  let current = parentOf(id);
  for (let step = 0; current !== undefined && step < boxes.length; step++) {
    if (current === baseId) return true;
    current = parentOf(current);
  }
  return false;
}
