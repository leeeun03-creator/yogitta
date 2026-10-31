import { lazy, Suspense, useMemo, useState } from "react";
import { roomAreas } from "@/features/spaces";
import { formatMeters } from "@/shared/lib/formatMeters";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box, Space } from "@/shared/types";
import type { FoundSpot } from "../logic/foundSpot";
import { slotOpening } from "../logic/slotOpening";
import type { BoxPicking } from "./BoxPicker";
import { wallToBoxes } from "../logic/wallToBoxes";
import styles from "./SceneView.module.css";

const PreviewCanvas = lazy(() =>
  import("./PreviewCanvas").then((module) => ({ default: module.PreviewCanvas })),
);

/** 3D 그림 이름 끝에 붙일 위치 표시: ", 찾은 가구 화장대 서랍장, 2번째 서랍 열림" (칸을 열지 않으면 가구만). */
function foundText(boxes: readonly Box[], found: readonly FoundSpot[] = []): string {
  const spot = found.find((candidate) => candidate.isPicked);
  const box = boxes.find((candidate) => candidate.id === spot?.boxId);
  if (!spot || !box) return "";
  const slot =
    slotOpening(box, spot.slot) && spot.slot !== undefined ? slotLabels(box)[spot.slot] : undefined;
  return `, 찾은 가구 ${box.name}${slot ? `, ${slot} 열림` : ""}`;
}

/** 이 브라우저가 3D(WebGL)를 그릴 수 있는지 본다. */
function canDraw3D(): boolean {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
}

type SceneViewProps = {
  space: Space;
  name: string; // 3D 그림 이름 앞머리: 편집 모드는 "3D 미리보기", 메인 화면은 "3D 공간"
  fallback: string; // 3D를 못 그리는 브라우저에서 보일 안내 문구
  picking?: BoxPicking; // 가구 고르기 (메인 화면만, 편집 모드 3D 미리보기는 고르지 않는다)
};

/** 공간의 3D 그림(바닥·구역 색·벽·가구)과 보기 버튼. 3D를 못 그리는 브라우저에서는 안내 문구를 보인다. */
export function SceneView({ space, name, fallback, picking }: SceneViewProps) {
  const { floor, walls, boxes, rooms, roomLines, roomAnchors } = space;
  const [canDraw] = useState(canDraw3D);
  // 2D 평면도와 같은 계산으로 구역 모양을 얻는다 (구역 선은 3D에 서지 않고 구역 경계로만 쓴다)
  const areas = useMemo(
    () => roomAreas(floor, [...walls, ...(roomLines ?? [])], rooms, roomAnchors),
    [floor, walls, roomLines, rooms, roomAnchors],
  );
  if (!canDraw) {
    return (
      <p className={styles.message} role="status">
        {fallback}
      </p>
    );
  }
  // 벽 하나(예: 사각형)는 선분 여러 개로 서므로 둘 다 알린다
  const segments = walls.flatMap(wallToBoxes).length;
  const label = `${name}, 바닥 ${formatMeters(floor.w)} × ${formatMeters(floor.h)} m, 벽 ${walls.length}개, 선분 ${segments}개, 구역 ${areas.length}개, 가구 ${boxes.length}개${foundText(boxes, picking?.found)}`;
  return (
    <div className={styles.view}>
      <Suspense fallback={<p className={styles.message}>3D를 불러오고 있어요</p>}>
        <PreviewCanvas
          floor={floor}
          walls={walls}
          boxes={boxes}
          areas={areas}
          label={label}
          picking={picking}
        />
      </Suspense>
    </div>
  );
}
