import { lazy, Suspense, useMemo, useState } from "react";
import { roomAreas } from "@/features/spaces";
import { formatMeters } from "@/shared/lib/formatMeters";
import type { Space } from "@/shared/types";
import { wallToBoxes } from "../logic/wallToBoxes";
import styles from "./ScenePreview.module.css";

const PreviewCanvas = lazy(() =>
  import("./PreviewCanvas").then((module) => ({ default: module.PreviewCanvas })),
);

/** 이 브라우저가 3D(WebGL)를 그릴 수 있는지 본다. */
function canDraw3D(): boolean {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
}

/** 편집 모드의 3D 미리보기 (바닥·구역 색·벽). 3D를 못 그리는 브라우저에서는 안내 문구를 보인다. */
export function ScenePreview({ space }: { space: Space }) {
  const { floor, walls, rooms, roomLines, roomAnchors } = space;
  const [canDraw] = useState(canDraw3D);
  // 2D 평면도와 같은 계산으로 구역 모양을 얻는다 (구역 선은 3D에 서지 않고 구역 경계로만 쓴다)
  const areas = useMemo(
    () => roomAreas(floor, [...walls, ...(roomLines ?? [])], rooms, roomAnchors),
    [floor, walls, roomLines, rooms, roomAnchors],
  );
  if (!canDraw) {
    return (
      <p className={styles.message} role="status">
        이 브라우저에서는 3D를 볼 수 없어요. 2D 평면도에서 계속 그릴 수 있어요.
      </p>
    );
  }
  // 벽 하나(예: 사각형)는 선분 여러 개로 서므로 둘 다 알린다
  const segments = walls.flatMap(wallToBoxes).length;
  const label = `3D 미리보기, 바닥 ${formatMeters(floor.w)} × ${formatMeters(floor.h)} m, 벽 ${walls.length}개, 선분 ${segments}개, 구역 ${areas.length}개`;
  return (
    <div className={styles.preview}>
      <Suspense fallback={<p className={styles.message}>3D를 불러오고 있어요</p>}>
        <PreviewCanvas floor={floor} walls={walls} areas={areas} label={label} />
      </Suspense>
    </div>
  );
}
