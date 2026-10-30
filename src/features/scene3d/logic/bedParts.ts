import { FURNITURE_COLORS, SCENE_COLORS } from "@/shared/constants/colors3d";
import { BED_HEADBOARD_CM } from "@/shared/constants/furniture";
import { PART_CM } from "@/shared/constants/furnitureParts";
import type { Box } from "@/shared/types";
import { partBetween, type FurniturePart } from "./furniturePart";

/**
 * 침대: 정면 반대쪽(로컬 -z) 머리판 + 프레임 + 매트리스. 침대 높이는 매트리스 윗면이고,
 * 머리판만 그보다 위로 올라온다 (2D 평면도의 머리판 띠와 같은 두께).
 */
export function bedParts(box: Pick<Box, "w" | "h" | "d">): FurniturePart[] {
  const { w, h, d } = box;
  const wood = { color: FURNITURE_COLORS.bed, hasEdges: true };
  const headboard = Math.min(BED_HEADBOARD_CM, d / 4);
  const mattress = Math.min(PART_CM.mattress, h / 2);
  const inset = Math.min(PART_CM.mattressInset, w / 8, d / 8);
  const back = -d / 2 + headboard; // 머리판 앞면 = 프레임 뒷면
  return [
    partBetween("headboard", [-w / 2, 0, -d / 2], [w / 2, h + PART_CM.headboardRise, back], wood),
    partBetween("frame", [-w / 2, 0, back], [w / 2, h - mattress, d / 2], wood),
    partBetween(
      "mattress",
      [-w / 2 + inset, h - mattress, back],
      [w / 2 - inset, h, d / 2 - inset],
      { color: SCENE_COLORS.mattress, hasEdges: true },
    ),
  ];
}
