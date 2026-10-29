import type { AppData } from "@/shared/types";

/** 지금 공간을 id 공간으로 바꾼 새 데이터. 없는 공간이거나 이미 지금 공간이면 그대로다. */
export function switchSpace(data: AppData, id: string): AppData {
  const exists = data.spaces.some((space) => space.id === id);
  if (!exists || data.currentSpaceId === id) return data;
  return { ...data, currentSpaceId: id };
}
