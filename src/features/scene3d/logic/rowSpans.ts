import { rowHeightsOf } from "@/shared/lib/rowHeightsOf";
import type { Box } from "@/shared/types";

/** 칸 하나가 차지하는 높이 (cm, 가구 아랫면부터). */
export type RowSpan = { bottom: number; height: number };

/**
 * 칸마다 높이 자리를 위 칸부터 돌려준다 (칸 번호 순서, "위에서 n번째 칸"). 칸 높이는 rowHeightsOf로 정하고,
 * 칸 높이 합이 가구 높이보다 작으면 남는 높이는 맨 아래 칸 밑의 빈 자리가 된다 (T30).
 */
export function rowSpans(box: Pick<Box, "h" | "rows" | "rowHeights">): RowSpan[] {
  let top = box.h;
  return rowHeightsOf(box).map((height) => {
    top -= height;
    return { bottom: top, height };
  });
}
