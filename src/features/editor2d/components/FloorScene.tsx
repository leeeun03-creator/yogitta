import type { Rect, RoomArea } from "@/features/spaces";
import type { Box, Floor, Point, RoomLine, Wall } from "@/shared/types";
import type { BoxPlacement } from "../logic/boxFromDrag";
import type { Measure } from "../logic/draftMeasure";
import type { Erasing } from "../hooks/useEraserTool";
import type { Snapped } from "../hooks/useSnapper";
import { BoxLayer } from "./BoxLayer";
import { FloorGrid } from "./FloorGrid";
import { LengthLabel } from "./LengthLabel";
import { RoomAreaLayer } from "./RoomAreaLayer";
import { RoomLabelLayer } from "./RoomLabelLayer";
import { RoomLineLayer } from "./RoomLineLayer";
import { SnapIndicator } from "./SnapIndicator";
import { WallLayer } from "./WallLayer";

export type SceneState = {
  draft: readonly Point[];
  previewCursor: Point | null;
  cursor: Snapped | null;
  measure: Measure | null;
  erasing: Erasing;
  roomLines: readonly RoomLine[];
  roomLineDraft: readonly Point[];
  roomAreas: readonly RoomArea[]; // 칠할 구역
  selectedRoom: string | null; // 고른 구역
  partPreview: { rects: Rect[]; color: string } | null; // 누르면 새 구역이 될 구획 (옅게)
  boxes: readonly Box[];
  boxDraft: BoxPlacement | null; // 가구 도구로 끄는 중인 사각형
};

type FloorSceneProps = { floor: Floor; walls: readonly Wall[]; scene: SceneState; cmPerPx: number };

/** 바닥·격자·구역 색·구역 선·벽·가구·구역 이름·미리보기·붙을 곳·길이 표시. 2D 평면도와 돋보기가 같은 그림을 그린다 (선·글자는 화면 1px = cmPerPx). */
export function FloorScene({ floor, walls, scene, cmPerPx }: FloorSceneProps) {
  return (
    <>
      <FloorGrid floor={floor} lineWidth={cmPerPx} />
      <RoomAreaLayer
        areas={scene.roomAreas}
        selected={scene.selectedRoom}
        preview={scene.partPreview}
      />
      <RoomLineLayer
        lines={scene.roomLines}
        draft={scene.roomLineDraft}
        erasing={scene.erasing.roomLine}
        cmPerPx={cmPerPx}
      />
      <WallLayer
        walls={walls}
        draft={scene.draft}
        cursor={scene.previewCursor}
        erasing={scene.erasing.wall}
        cmPerPx={cmPerPx}
      />
      {/* 가구는 벽 위에 그려, 벽에 붙여 놓아도 테두리와 이름이 가려지지 않게 한다 */}
      <BoxLayer boxes={scene.boxes} draft={scene.boxDraft} cmPerPx={cmPerPx} />
      <RoomLabelLayer areas={scene.roomAreas} selected={scene.selectedRoom} cmPerPx={cmPerPx} />
      <SnapIndicator cursor={scene.cursor} cmPerPx={cmPerPx} />
      <LengthLabel measure={scene.measure} cmPerPx={cmPerPx} />
    </>
  );
}
