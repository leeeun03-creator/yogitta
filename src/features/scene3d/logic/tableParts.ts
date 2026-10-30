import { FURNITURE_COLORS } from "@/shared/constants/colors3d";
import { PART_CM } from "@/shared/constants/furnitureParts";
import type { Box } from "@/shared/types";
import { partBetween, type FurniturePart } from "./furniturePart";

/** 책상·테이블: 상판 + 모서리 다리 4개. 다리는 상판 가장자리에서 조금 들인다. 작은 가구면 두께·굵기를 줄인다. */
export function tableParts(box: Pick<Box, "type" | "w" | "h" | "d">): FurniturePart[] {
  const { w, h, d } = box;
  const look = { color: FURNITURE_COLORS[box.type], hasEdges: true };
  const top = Math.min(PART_CM.tableTop, h / 4);
  const leg = Math.min(PART_CM.leg, w / 4, d / 4);
  const inset = Math.min(PART_CM.legInset, w / 8, d / 8);
  const xs = [-w / 2 + inset, w / 2 - inset - leg]; // 다리 왼쪽 면
  const zs = [-d / 2 + inset, d / 2 - inset - leg]; // 다리 뒷면
  const legs = xs.flatMap((x, column) =>
    zs.map((z, row) =>
      partBetween(`leg-${column}-${row}`, [x, 0, z], [x + leg, h - top, z + leg], look),
    ),
  );
  return [partBetween("top", [-w / 2, h - top, -d / 2], [w / 2, h, d / 2], look), ...legs];
}
