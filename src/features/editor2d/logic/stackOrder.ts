import type { Box } from "@/shared/types";

/**
 * 가구를 낮은 것부터(설치 높이 순, 같으면 원래 순서) 늘어놓는다 (T29).
 * 2D 평면도는 이 순서로 그려 가구 위 가구·벽걸이가 위에 보이고, 누르면 위에 보이는 가구가 골라진다.
 */
export function stackOrder<T extends Pick<Box, "elevation">>(boxes: readonly T[]): T[] {
  return [...boxes].sort((a, b) => a.elevation - b.elevation);
}
