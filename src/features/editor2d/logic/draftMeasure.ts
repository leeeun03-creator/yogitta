import { LENGTH_LABEL_CHAR_EM } from "@/shared/constants/floorPlan";
import type { Point } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "./fitViewBox";
import { formatLength } from "./formatLength";
import { labelPosition } from "./labelPosition";

export type Measure = { text: string; at: Point };

export type DraftMeasureInput = {
  tool: DrawingTool;
  draft: readonly Point[]; // 사각형은 미리보기 점(왼쪽 위부터), 직선·연속선은 찍은 점
  cursor: Point | null; // 직선·연속선에서 지금 그리는 선분의 끝
  box: ViewBox;
  gap: number; // 선 가운데에서 글자 상자까지 (cm)
  fontSize: number; // 글자 크기 (cm)
};

/** 그리는 동안의 길이 표시. 사각형은 가운데에 "가로 × 세로", 직선·연속선은 지금 선분 옆에 길이. 보여줄 길이가 없으면 null. */
export function draftMeasure(input: DraftMeasureInput): Measure | null {
  const segment = measuredSegment(input);
  if (!segment) return null;
  const { text, from, to } = segment;
  // 글자 상자 크기는 글자 수로 어림한다 (DOM을 재지 않는 순수 함수라서)
  const half = {
    x: (text.length * input.fontSize * LENGTH_LABEL_CHAR_EM) / 2,
    y: input.fontSize / 2,
  };
  return { text, at: labelPosition(from, to, input.gap, half, input.box) };
}

/** 길이를 잴 선분과 글자. 사각형은 가운데 한 점(from = to)에 "가로 × 세로". */
function measuredSegment({ tool, draft, cursor }: DraftMeasureInput) {
  if (tool === "rect") {
    const [topLeft, , bottomRight] = draft;
    if (!topLeft || !bottomRight) return null;
    const text = formatLength(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    const center = { x: (topLeft.x + bottomRight.x) / 2, y: (topLeft.y + bottomRight.y) / 2 };
    return text ? { text, from: center, to: center } : null;
  }
  const last = draft.at(-1);
  if (!last || !cursor) return null;
  const text = formatLength(Math.hypot(cursor.x - last.x, cursor.y - last.y));
  return text ? { text, from: last, to: cursor } : null;
}
