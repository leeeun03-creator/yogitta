import { lazy, Suspense, useState } from "react";
import { formatMeters } from "@/shared/lib/formatMeters";
import type { Floor } from "@/shared/types";
import styles from "./ScenePreview.module.css";

const PreviewCanvas = lazy(() =>
  import("./PreviewCanvas").then((module) => ({ default: module.PreviewCanvas })),
);

/** 이 브라우저가 3D(WebGL)를 그릴 수 있는지 본다. */
function canDraw3D(): boolean {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
}

/** 편집 모드의 3D 미리보기. 3D를 못 그리는 브라우저에서는 안내 문구를 보인다. */
export function ScenePreview({ floor }: { floor: Floor }) {
  const [canDraw] = useState(canDraw3D);
  if (!canDraw) {
    return (
      <p className={styles.message} role="status">
        이 브라우저에서는 3D를 볼 수 없어요. 2D 평면도에서 계속 그릴 수 있어요.
      </p>
    );
  }
  const label = `3D 미리보기, 바닥 ${formatMeters(floor.w)} × ${formatMeters(floor.h)} m`;
  return (
    <div className={styles.preview} role="img" aria-label={label}>
      <Suspense fallback={<p className={styles.message}>3D를 불러오고 있어요</p>}>
        <PreviewCanvas floor={floor} />
      </Suspense>
    </div>
  );
}
