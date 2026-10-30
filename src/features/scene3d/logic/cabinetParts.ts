import { FURNITURE_COLORS, SCENE_COLORS } from "@/shared/constants/colors3d";
import { PART_CM } from "@/shared/constants/furnitureParts";
import type { Box } from "@/shared/types";
import { frontLayout } from "./frontLayout";
import { partBetween, type FurniturePart } from "./furniturePart";

/**
 * 양문 수납장: 몸통 + 문 두 짝(가운데 틈) + 문마다 가운데 쪽 세로 손잡이.
 * 안쪽 선반은 문에 가려 보이지 않으니 칸 열림(T28) 때 만든다.
 */
export function cabinetParts(box: Pick<Box, "w" | "h" | "d">): FurniturePart[] {
  const { w, h, d } = box;
  const body = { color: FURNITURE_COLORS.cabinet, hasEdges: true };
  const handleLook = { color: SCENE_COLORS.edge, hasEdges: false };
  const { bodyFront, frontFace } = frontLayout(d, PART_CM.doorHandle.depth);
  const gap = Math.min(PART_CM.gap, w / 4);
  const doorWidth = (w - gap) / 2;
  const handleWidth = Math.min(PART_CM.doorHandle.width, doorWidth / 4);
  const handleHeight = Math.min(PART_CM.doorHandle.height, h / 2);
  const handleY: [number, number] = [(h - handleHeight) / 2, (h + handleHeight) / 2];
  // 손잡이는 틈에서 손잡이 폭만큼 떨어진 자리에 단다
  const inner = gap / 2 + handleWidth;
  return [
    partBetween("body", [-w / 2, 0, -d / 2], [w / 2, h, bodyFront], body),
    partBetween("door-left", [-w / 2, 0, bodyFront], [-gap / 2, h, frontFace], body),
    partBetween("door-right", [gap / 2, 0, bodyFront], [w / 2, h, frontFace], body),
    partBetween(
      "handle-left",
      [-inner - handleWidth, handleY[0], frontFace],
      [-inner, handleY[1], d / 2],
      handleLook,
    ),
    partBetween(
      "handle-right",
      [inner, handleY[0], frontFace],
      [inner + handleWidth, handleY[1], d / 2],
      handleLook,
    ),
  ];
}
