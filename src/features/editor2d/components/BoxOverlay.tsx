import type { DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { BoxButtons } from "./BoxButtons";
import type { SceneState } from "./FloorScene";
import { SelectedBoxLabel } from "./SelectedBoxLabel";

type BoxOverlayProps = {
  tool: DrawingTool;
  scene: Pick<SceneState, "boxes" | "selectedBox">; // 끄는 중이면 옮길 자리에 있는 가구들, 고른 가구
  view: ViewBox;
  onRemoved: () => void; // 키보드로 가구를 지운 뒤 (초점을 2D 평면도로 돌린다)
};

/** 2D 평면도 위에 겹치는 가구 화면 요소: 고른 가구 이름 알약, 선택 도구일 때 키보드용 가구 버튼. */
export function BoxOverlay({ tool, scene, view, onRemoved }: BoxOverlayProps) {
  const { boxes, selectedBox: selected } = scene;
  return (
    <>
      {tool === "select" && (
        <BoxButtons boxes={boxes} selected={selected} view={view} onRemoved={onRemoved} />
      )}
      <SelectedBoxLabel box={boxes.find((box) => box.id === selected)} view={view} />
    </>
  );
}
