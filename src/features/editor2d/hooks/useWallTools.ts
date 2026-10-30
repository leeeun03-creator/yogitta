import { DIMENSION_FONT_PX, LENGTH_LABEL_GAP_PX } from "@/shared/constants/floorPlan";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import { isWallBlocked } from "@/shared/lib/isWallBlocked";
import type { Box, Wall } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import { draftMeasure, type DraftMeasureInput } from "../logic/draftMeasure";
import type { ViewBox } from "../logic/fitViewBox";
import { mergeHandlers } from "./mergeHandlers";
import { useDrawTool } from "./useDrawTool";
import { useRectTool } from "./useRectTool";
import { useWallPointDrag } from "./useWallPointDrag";
import type { SnapAt } from "./useSnapper";

const BLOCKED_MESSAGE = "가구와 겹치는 자리에는 벽을 그을 수 없어요";

type WallToolsInput = {
  snapAt: SnapAt;
  walls: readonly Wall[];
  boxes: readonly Box[];
  notify: (message: string) => void;
};

/** 길이 표시는 화면 px 기준 크기로 둔다 (선 가운데에서 글자까지 = 벽 두께 절반 + 간격). */
const measureOf = (input: Omit<DraftMeasureInput, "gap" | "fontSize">) =>
  draftMeasure({
    ...input,
    gap: WALL_THICKNESS_CM / 2 + LENGTH_LABEL_GAP_PX * input.box.cmPerPx,
    fontSize: DIMENSION_FONT_PX * input.box.cmPerPx,
  });

/**
 * 벽을 그리는 도구(직선·연속선·사각형)와 그 미리보기·붙을 곳·길이 표시, 선택 도구로 벽 점 끌기.
 * 가구를 지나가는 벽은 그어지지 않고 안내(notify)하며, 그런 미리보기는 삭제색이다.
 * walls는 벽 점을 끄는 동안 옮긴 벽(아니면 null)이다.
 */
export function useWallTools(tool: DrawingTool, box: ViewBox, input: WallToolsInput) {
  const { boxes, notify } = input;
  const wallInput = { ...input, onBlocked: () => notify(BLOCKED_MESSAGE) };
  const draw = useDrawTool(tool, box, wallInput);
  const rect = useRectTool(tool, wallInput);
  const point = useWallPointDrag(tool, box, input);
  const draft = tool === "rect" ? rect.preview : draw.points;
  // 그리던 점에 커서를 이어 그리는 미리보기는 직선·연속선만 (사각형은 끄는 모양이 미리보기)
  const previewCursor = tool === "rect" ? null : (draw.cursor?.point ?? null);
  const preview = previewCursor && draft.length > 0 ? [...draft, previewCursor] : draft;
  return {
    tap: draw.tap,
    walls: point.walls,
    isMovingPoint: point.isDragging,
    scene: {
      draft,
      previewCursor,
      isDraftBlocked: isWallBlocked({ points: preview, closed: false }, boxes),
      cursor: draw.cursor, // 붙을 곳 표시
      measure: measureOf({ tool, draft, cursor: previewCursor, box }),
    },
    handlers: mergeHandlers(draw.handlers, rect.handlers, point.handlers),
  };
}
