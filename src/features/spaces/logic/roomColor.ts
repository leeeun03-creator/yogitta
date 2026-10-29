import { ROOM_COLORS } from "@/shared/constants/colors2d";

/** 구역 목록에서 index번째 구역의 색. 6색을 차례로 돌려 쓴다 (7번째부터 처음 색). */
export function roomColor(index: number): string {
  return ROOM_COLORS[index % ROOM_COLORS.length] ?? ROOM_COLORS[0];
}
