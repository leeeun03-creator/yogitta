import type { Floor, Point, Wall } from "@/shared/types";
import type { Measure } from "../logic/draftMeasure";
import type { Snapped } from "../hooks/useSnapper";
import { FloorGrid } from "./FloorGrid";
import { LengthLabel } from "./LengthLabel";
import { SnapIndicator } from "./SnapIndicator";
import { WallLayer } from "./WallLayer";

export type SceneState = {
  draft: readonly Point[];
  previewCursor: Point | null;
  cursor: Snapped | null;
  measure: Measure | null;
  erasing: { from: Point; to: Point } | null;
};

type FloorSceneProps = { floor: Floor; walls: readonly Wall[]; scene: SceneState; cmPerPx: number };

/** 바닥·격자·벽·미리보기·붙을 곳·길이 표시. 2D 평면도와 돋보기가 같은 그림을 그린다 (선·글자는 화면 1px = cmPerPx). */
export function FloorScene({ floor, walls, scene, cmPerPx }: FloorSceneProps) {
  return (
    <>
      <FloorGrid floor={floor} lineWidth={cmPerPx} />
      <WallLayer
        walls={walls}
        draft={scene.draft}
        cursor={scene.previewCursor}
        erasing={scene.erasing}
        cmPerPx={cmPerPx}
      />
      <SnapIndicator cursor={scene.cursor} cmPerPx={cmPerPx} />
      <LengthLabel measure={scene.measure} cmPerPx={cmPerPx} />
    </>
  );
}
