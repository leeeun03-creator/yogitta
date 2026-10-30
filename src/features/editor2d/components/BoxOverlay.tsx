import type { Box } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { BoxButtons } from "./BoxButtons";
import { SelectedBoxLabel } from "./SelectedBoxLabel";

type BoxOverlayProps = {
  tool: DrawingTool;
  boxes: readonly Box[];
  selected: string | null; // 고른(또는 끄는 중인) 가구
  view: ViewBox;
};

/** 2D 평면도 위에 겹치는 가구 화면 요소: 고른 가구 이름 알약, 선택 도구일 때 키보드용 가구 버튼. */
export function BoxOverlay({ tool, boxes, selected, view }: BoxOverlayProps) {
  return (
    <>
      {tool === "select" && <BoxButtons boxes={boxes} selected={selected} view={view} />}
      <SelectedBoxLabel box={boxes.find((box) => box.id === selected)} view={view} />
    </>
  );
}
