import { BOX_ROWS_RANGE, ROW_TYPES } from "@/shared/constants/furniture";
import type { AppData, Box } from "@/shared/types";
import { itemsWithinSlots } from "./itemsWithinSlots";
import { updateBox } from "./updateBox";

/**
 * 현재 공간의 가구 하나의 칸 수(세로)를 바꾼다. 칸 수를 바꿀 수 있는 종류(양문 수납장·서랍장·선반·벽걸이)만,
 * 1 ~ 8칸 안에서만 바뀐다. 줄어든 칸의 물건은 칸 없음으로 옮기고, 정해 둔 칸 높이는 지운다(균등 분배).
 */
export function changeBoxRows(data: AppData, id: string, rows: number): AppData {
  return updateBox(data, id, (box) => {
    const isAllowed = ROW_TYPES.includes(box.type) && Number.isInteger(rows);
    if (!isAllowed || rows < BOX_ROWS_RANGE.min || rows > BOX_ROWS_RANGE.max) return box;
    if (rows === box.rows) return box;
    const next: Box = { ...box, rows, items: itemsWithinSlots(box.items, rows * box.cols) };
    delete next.rowHeights;
    return next;
  });
}
