import type { Box } from "@/shared/types";

/**
 * box를 base 위에 올리면 될 설치 높이 = 받침 가구 설치 높이 + 받침 가구 높이 (T29).
 * base가 null(바닥에 둠)이면 가구 위 가구였던 것은 바닥(0)으로 내려오고, 원래 바닥 가구는 그대로다(벽걸이는 띄운 높이).
 */
export function stackedElevation(
  box: Pick<Box, "elevation" | "parentId">,
  base: Pick<Box, "elevation" | "h"> | null,
): number {
  if (base) return base.elevation + base.h;
  return box.parentId === undefined ? box.elevation : 0;
}
