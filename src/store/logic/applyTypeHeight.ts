import { FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import type { AppData, Box } from "@/shared/types";
import { updateStackedBox } from "./updateStackedBox";

/**
 * 현재 공간의 가구 하나를 그 종류의 기본 높이로 바꾼다. 정해 둔 칸 높이는 합이 맞지 않게 되니
 * 균등 분배로 돌린다. 이미 기본 높이면 그대로 둔다. 그 위에 올린 가구의 설치 높이도 따라 바뀐다 (T29-2).
 */
export function applyTypeHeight(data: AppData, id: string): AppData {
  return updateStackedBox(data, id, (box) => {
    const { h } = FURNITURE_DEFAULTS[box.type];
    if (box.h === h) return box;
    const next: Box = { ...box, h };
    delete next.rowHeights;
    return next;
  });
}
