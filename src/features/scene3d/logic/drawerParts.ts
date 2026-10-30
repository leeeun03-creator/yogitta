import { FURNITURE_COLORS, SCENE_COLORS } from "@/shared/constants/colors3d";
import { PART_CM } from "@/shared/constants/furnitureParts";
import type { Box } from "@/shared/types";
import { frontLayout } from "./frontLayout";
import { partBetween, type FurniturePart } from "./furniturePart";
import { rowSpans } from "./rowSpans";

/** 서랍장: 몸통 + 칸마다 서랍 앞판(위아래 틈) + 가운데 가로 손잡이. 칸은 위에서부터 번호를 붙인다. */
export function drawerParts(
  box: Pick<Box, "w" | "h" | "d" | "rows" | "rowHeights">,
): FurniturePart[] {
  const { w, h, d } = box;
  const body = { color: FURNITURE_COLORS.drawer, hasEdges: true };
  const handleLook = { color: SCENE_COLORS.edge, hasEdges: false };
  const { bodyFront, frontFace } = frontLayout(d, PART_CM.drawerHandle.depth);
  const handleWidth = Math.min(PART_CM.drawerHandle.width, w / 3);
  const drawers = rowSpans(box).flatMap(({ bottom, height }, row) => {
    const gap = Math.min(PART_CM.gap, height / 4);
    const handleHeight = Math.min(PART_CM.drawerHandle.height, height / 4);
    const middle = bottom + height / 2;
    return [
      partBetween(
        `front-${row}`,
        [-w / 2, bottom + gap / 2, bodyFront],
        [w / 2, bottom + height - gap / 2, frontFace],
        body,
      ),
      partBetween(
        `handle-${row}`,
        [-handleWidth / 2, middle - handleHeight / 2, frontFace],
        [handleWidth / 2, middle + handleHeight / 2, d / 2],
        handleLook,
      ),
    ];
  });
  return [partBetween("body", [-w / 2, 0, -d / 2], [w / 2, h, bodyFront], body), ...drawers];
}
