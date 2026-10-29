import { DIMENSION_FONT_PX, LENGTH_LABEL_GAP_PX } from "@/shared/constants/floorPlan";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { DrawingTool } from "@/store/useAppStore";
import { draftMeasure, type DraftMeasureInput } from "../logic/draftMeasure";
import type { ViewBox } from "../logic/fitViewBox";
import { mergeHandlers } from "./mergeHandlers";
import { useDrawTool } from "./useDrawTool";
import { useRectTool } from "./useRectTool";
import type { SnapAt } from "./useSnapper";

/** 길이 표시는 화면 px 기준 크기로 둔다 (선 가운데에서 글자까지 = 벽 두께 절반 + 간격). */
const measureOf = (input: Omit<DraftMeasureInput, "gap" | "fontSize">) =>
  draftMeasure({
    ...input,
    gap: WALL_THICKNESS_CM / 2 + LENGTH_LABEL_GAP_PX * input.box.cmPerPx,
    fontSize: DIMENSION_FONT_PX * input.box.cmPerPx,
  });

/** 벽을 그리는 도구(직선·연속선·사각형)와 그 미리보기·붙을 곳·길이 표시. */
export function useWallTools(tool: DrawingTool, box: ViewBox, snapAt: SnapAt) {
  const draw = useDrawTool(tool, box, snapAt);
  const rect = useRectTool(tool, snapAt);
  const draft = tool === "rect" ? rect.preview : draw.points;
  // 그리던 점에 커서를 이어 그리는 미리보기는 직선·연속선만 (사각형은 끄는 모양이 미리보기)
  const previewCursor = tool === "rect" ? null : (draw.cursor?.point ?? null);
  return {
    tap: draw.tap,
    scene: {
      draft,
      previewCursor,
      cursor: draw.cursor, // 붙을 곳 표시
      measure: measureOf({ tool, draft, cursor: previewCursor, box }),
    },
    handlers: mergeHandlers(draw.handlers, rect.handlers),
  };
}
