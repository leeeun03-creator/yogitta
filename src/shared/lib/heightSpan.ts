import type { Box } from "@/shared/types";

/** 가구가 차지하는 높이 범위 (cm, 바닥에서). */
export type HeightSpan = { bottom: number; top: number };

/** 가구가 차지하는 높이 범위: 설치 높이부터 설치 높이 + 높이까지. */
export function heightSpan(box: Pick<Box, "elevation" | "h">): HeightSpan {
  return { bottom: box.elevation, top: box.elevation + box.h };
}
