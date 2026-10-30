import { SELECTED_LABEL_GAP_PX, SELECTED_LABEL_HEIGHT_PX } from "@/shared/constants/floorPlan";
import type { ScreenRect } from "./boxScreenRect";

/**
 * 고른 가구 이름 알약의 위쪽 끝 (px). 시안 04처럼 가구 위에 띄우되,
 * 위에 자리가 없으면(2D 평면도 위쪽 끝 가구) 가려지지 않게 가구 아래에 띄운다.
 */
export function selectedLabelTop(rect: ScreenRect): number {
  const above = rect.top - SELECTED_LABEL_GAP_PX - SELECTED_LABEL_HEIGHT_PX;
  return above >= 0 ? above : rect.top + rect.height + SELECTED_LABEL_GAP_PX;
}
