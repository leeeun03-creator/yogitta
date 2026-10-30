import type { Box } from "@/shared/types";

/** 칸 하나가 차지하는 높이 (cm, 가구 아랫면부터). */
export type RowSpan = { bottom: number; height: number };

const SUM_TOLERANCE_CM = 0.5; // 칸 높이 합과 가구 높이의 반올림 오차

/** 정해 둔 칸 높이가 칸 수와 맞고 모두 0보다 크며 합이 가구 높이와 같을 때만 쓴다. */
function isUsable(box: Pick<Box, "h" | "rows" | "rowHeights">): box is Pick<Box, "h" | "rows"> & {
  rowHeights: number[];
} {
  const heights = box.rowHeights;
  if (!heights || heights.length !== box.rows || heights.some((height) => height <= 0))
    return false;
  const sum = heights.reduce((total, height) => total + height, 0);
  return Math.abs(sum - box.h) <= SUM_TOLERANCE_CM;
}

/**
 * 칸마다 높이 자리를 위 칸부터 돌려준다 (칸 번호 순서, "위에서 n번째 칸").
 * 칸 높이(rowHeights)가 없거나 맞지 않으면 가구 높이를 칸 수로 균등 분배한다.
 */
export function rowSpans(box: Pick<Box, "h" | "rows" | "rowHeights">): RowSpan[] {
  const rows = Math.max(1, box.rows);
  const heights = isUsable(box) ? box.rowHeights : Array<number>(rows).fill(box.h / rows);
  let top = box.h;
  return heights.map((height) => {
    top -= height;
    return { bottom: top, height };
  });
}
