import type { Box } from "@/shared/types";

/** 칸 높이 합이 가구 높이를 넘었다고 보지 않는 반올림 오차 (cm). */
export const ROW_SUM_TOLERANCE_CM = 0.5;

/**
 * 칸마다 높이 (cm, 위 칸부터, T30). 정해 둔 칸 높이(rowHeights)가 칸 수와 맞고 모두 0보다 크며 합이 가구 높이를
 * 넘지 않을 때만 그대로 쓰고(합이 작으면 남는 높이는 맨 아래 빈 자리), 아니면 가구 높이를 칸 수로 균등 분배한다.
 */
export function rowHeightsOf(box: Pick<Box, "h" | "rows" | "rowHeights">): number[] {
  const rows = Math.max(1, box.rows);
  const heights = box.rowHeights;
  const sum = heights?.reduce((total, height) => total + height, 0) ?? 0;
  const isUsable =
    heights !== undefined &&
    heights.length === rows &&
    heights.every((height) => height > 0) &&
    sum <= box.h + ROW_SUM_TOLERANCE_CM;
  return isUsable ? [...heights] : Array<number>(rows).fill(box.h / rows);
}
