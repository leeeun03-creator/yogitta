import type { AppData } from "@/shared/types";

/**
 * id 공간(벽·가구·물건 모두)을 지운 새 데이터. 지금 공간을 지우면 그 자리의 다음 공간(마지막이었으면 앞 공간)이
 * 지금 공간이 되고, 남은 공간이 없으면 null(첫 실행 화면)이다. 없는 공간이면 그대로다.
 */
export function removeSpace(data: AppData, id: string): AppData {
  const index = data.spaces.findIndex((space) => space.id === id);
  if (index < 0) return data;
  const spaces = data.spaces.filter((space) => space.id !== id);
  if (data.currentSpaceId !== id) return { ...data, spaces };
  const next = spaces[index] ?? spaces[index - 1];
  return { ...data, spaces, currentSpaceId: next?.id ?? null };
}
