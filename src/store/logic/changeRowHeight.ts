import { BOX_MIN_SIZE_CM } from "@/shared/constants/furniture";
import { ROW_SUM_TOLERANCE_CM, rowHeightsOf } from "@/shared/lib/rowHeightsOf";
import type { AppData } from "@/shared/types";
import { currentBox } from "./currentBox";
import { updateBox } from "./updateBox";

/** 칸 높이를 못 바꾸는 까닭: 최소보다 작음(tooSmall), 칸 높이 합이 가구 높이를 넘음(overHeight). */
export type RowHeightBlock = "tooSmall" | "overHeight";
export type RowHeightResult = { ok: true; data: AppData } | { ok: false; reason: RowHeightBlock };

/**
 * 현재 공간의 가구 하나의 row번째 칸(위에서부터) 높이를 height(cm)로 바꾼다 (T30). 나머지 칸은 지금 높이 그대로이고
 * (정해 둔 칸 높이가 없으면 균등 분배 값), 합이 가구 높이보다 작으면 남는 높이는 맨 아래 빈 자리가 된다.
 * 없는 가구·칸이거나 높이가 같으면 원본 그대로다.
 */
export function changeRowHeight(
  data: AppData,
  id: string,
  row: number,
  height: number,
): RowHeightResult {
  const box = currentBox(data, id);
  const heights = box && rowHeightsOf(box);
  if (!box || !heights || heights[row] === undefined || heights[row] === height) {
    return { ok: true, data };
  }
  if (height < BOX_MIN_SIZE_CM) return { ok: false, reason: "tooSmall" };
  const next = heights.map((current, index) => (index === row ? height : current));
  const sum = next.reduce((total, value) => total + value, 0);
  if (sum > box.h + ROW_SUM_TOLERANCE_CM) return { ok: false, reason: "overHeight" };
  return { ok: true, data: updateBox(data, id, (target) => ({ ...target, rowHeights: next })) };
}
