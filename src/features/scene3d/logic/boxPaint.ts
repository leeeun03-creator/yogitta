import {
  DIM_RATIO,
  FOUND_COLORS,
  FURNITURE_COLORS,
  SCENE_COLORS,
} from "@/shared/constants/colors3d";
import { mixColor } from "@/shared/lib/mixColor";
import type { FurnitureType } from "@/shared/types";

/** 위치 표시 중 가구 칠하기: 보통, 찾은 가구, 흐리게(찾은 가구가 따로 있을 때 나머지). */
export type PaintMode = "normal" | "found" | "dim";

/**
 * 가구 부품 색을 위치 표시에 맞게 바꾸는 함수 (yogitta-design 5장). 찾은 가구는 몸통(종류 나무 톤)만 찾은 가구 색으로
 * 바꾸고 손잡이·매트리스는 그대로 둔다. 흐리게는 모든 색을 바탕색 쪽으로 55% 섞는다.
 */
export function boxPaint(type: FurnitureType, mode: PaintMode): (color: string) => string {
  if (mode === "found") {
    return (color) => (color === FURNITURE_COLORS[type] ? FOUND_COLORS.box : color);
  }
  if (mode === "dim") return (color) => mixColor(color, SCENE_COLORS.dimTarget, DIM_RATIO);
  return (color) => color;
}
