import { ROW_SUM_TOLERANCE_CM } from "@/shared/lib/rowHeightsOf";
import { formatCm } from "./formatCm";

/** 칸 높이 합계 문구와 넘었는지 (T30-2). */
export type RowSum = { text: string; isOver: boolean };

/**
 * 칸 높이 합계 줄 (시안 04 "합계 90 / 전체 높이 90"). 합이 전체 높이보다 작으면 맨 아래 빈 자리를 알려 주고,
 * 넘으면 isOver다 (입력 중인 값으로 바로 보여 준다).
 */
export function rowSum(heights: readonly number[], totalCm: number): RowSum {
  const sum = heights.reduce((total, height) => total + height, 0);
  const text = `합계 ${formatCm(sum)} / 전체 높이 ${formatCm(totalCm)}`;
  const empty = totalCm - sum;
  return {
    text: empty > ROW_SUM_TOLERANCE_CM ? `${text} · 아래 ${formatCm(empty)}cm는 빈 자리예요` : text,
    isOver: -empty > ROW_SUM_TOLERANCE_CM,
  };
}
