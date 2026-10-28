import type { AppData, Space } from "@/shared/types";

/** 현재 공간 하나만 바꾼 새 데이터를 돌려준다. 현재 공간이 없으면 원본을 그대로 돌려준다. */
export function updateCurrentSpace(data: AppData, update: (space: Space) => Space): AppData {
  const index = data.spaces.findIndex((space) => space.id === data.currentSpaceId);
  const current = data.spaces[index];
  if (!current) return data;

  const next = update(current);
  if (next === current) return data;
  const spaces = [...data.spaces];
  spaces[index] = next;
  return { ...data, spaces };
}
