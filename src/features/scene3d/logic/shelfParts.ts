import { FURNITURE_COLORS } from "@/shared/constants/colors3d";
import { PART_CM } from "@/shared/constants/furnitureParts";
import type { Box } from "@/shared/types";
import { partBetween, type FurniturePart } from "./furniturePart";
import { rowSpans } from "./rowSpans";

/**
 * 선반·벽걸이: 옆판 2 + 뒤판 + 위아래 판 + 칸 사이 선반 판, 앞은 뚫려 있다.
 * 벽걸이는 같은 모양을 설치 높이에 띄운다 (띄우는 것은 가구를 세우는 쪽에서 한다).
 */
export function shelfParts(
  box: Pick<Box, "type" | "w" | "h" | "d" | "rows" | "rowHeights">,
): FurniturePart[] {
  const { w, h, d } = box;
  const look = { color: FURNITURE_COLORS[box.type], hasEdges: true };
  const t = Math.min(PART_CM.board, w / 4, h / 4, d / 4); // 작은 가구면 판도 얇게
  const inner = { left: -w / 2 + t, right: w / 2 - t, back: -d / 2 + t };
  const board = (key: string, at: number) => {
    const y = Math.min(Math.max(at, t / 2), h - t / 2); // 아주 낮은 칸에서도 가구 높이 안에
    return partBetween(
      key,
      [inner.left, y - t / 2, inner.back],
      [inner.right, y + t / 2, d / 2],
      look,
    );
  };
  // 맨 아래 칸의 아랫면은 바닥 판이라 위 칸들의 아랫면에만 선반 판을 넣는다
  const dividers = rowSpans(box)
    .slice(0, -1)
    .map(({ bottom }, row) => board(`board-${row}`, bottom));
  return [
    partBetween("side-left", [-w / 2, 0, -d / 2], [inner.left, h, d / 2], look),
    partBetween("side-right", [inner.right, 0, -d / 2], [w / 2, h, d / 2], look),
    partBetween("back", [inner.left, 0, -d / 2], [inner.right, h, inner.back], look),
    board("top", h - t / 2),
    board("bottom", t / 2),
    ...dividers,
  ];
}
