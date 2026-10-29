import type { Floor, Point, RoomLine, Wall } from "@/shared/types";
import type { Measure } from "../logic/draftMeasure";
import type { Erasing } from "../hooks/useEraserTool";
import type { Snapped } from "../hooks/useSnapper";
import { FloorGrid } from "./FloorGrid";
import { LengthLabel } from "./LengthLabel";
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
};

type FloorSceneProps = { floor: Floor; walls: readonly Wall[]; scene: SceneState; cmPerPx: number };

/** 바닥·격자·구역 선·벽·미리보기·붙을 곳·길이 표시. 2D 평면도와 돋보기가 같은 그림을 그린다 (선·글자는 화면 1px = cmPerPx). */
export function FloorScene({ floor, walls, scene, cmPerPx }: FloorSceneProps) {
  return (
    <>
      <FloorGrid floor={floor} lineWidth={cmPerPx} />
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
      <SnapIndicator cursor={scene.cursor} cmPerPx={cmPerPx} />
      <LengthLabel measure={scene.measure} cmPerPx={cmPerPx} />
    </>
  );
}
