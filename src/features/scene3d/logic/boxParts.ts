import { FURNITURE_COLORS, SCENE_COLORS } from "@/shared/constants/colors3d";
import { BOX_HANDLE_3D } from "@/shared/constants/scene";
import type { Box } from "@/shared/types";
import { partBetween, type FurniturePart } from "./furniturePart";

/**
 * 보관함: 상자 하나 + 정면 위쪽 손잡이 홈 (가로의 40%, 최대 20cm). 손잡이 홈이 2D 평면도의 정면 삼각형처럼
 * 정면을 알려 준다. 홈은 정면에 붙여 반만큼 나온다.
 */
export function boxParts(box: Pick<Box, "type" | "w" | "h" | "d">): FurniturePart[] {
  const { w, h, d } = box;
  const { widthRatio, maxWidth, height, heightRatio, depth } = BOX_HANDLE_3D;
  const handleWidth = Math.min(w * widthRatio, maxWidth);
  const handleHeight = Math.min(height, h / 2); // 아주 낮은 가구에서도 가구 높이를 넘지 않게
  const handleY = Math.min(h * heightRatio, h - handleHeight / 2);
  return [
    partBetween("body", [-w / 2, 0, -d / 2], [w / 2, h, d / 2], {
      color: FURNITURE_COLORS[box.type],
      hasEdges: true,
    }),
    partBetween(
      "handle",
      [-handleWidth / 2, handleY - handleHeight / 2, d / 2 - depth / 2],
      [handleWidth / 2, handleY + handleHeight / 2, d / 2 + depth / 2],
      { color: SCENE_COLORS.edge, hasEdges: false },
    ),
  ];
}
