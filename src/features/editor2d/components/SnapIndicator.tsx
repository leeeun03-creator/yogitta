import type { Snapped } from "../hooks/useSnapper";
import styles from "./FloorPlan.module.css";

const GRID_DOT_PX = 3;
const RING_STROKE_PX = 2;
const RING_RADIUS_PX = 9; // 붙는 거리(12px)보다 조금 작게

type SnapIndicatorProps = { cursor: Snapped | null; cmPerPx: number };

/** 커서가 붙을 곳: 벽 점이면 강조색 고리, 격자면 작은 강조색 점. 스냅이 꺼져 있으면 보이지 않는다. */
export function SnapIndicator({ cursor, cmPerPx }: SnapIndicatorProps) {
  if (!cursor || cursor.kind === "none") return null;
  const { x, y } = cursor.point;
  if (cursor.kind === "endpoint") {
    return (
      <circle
        data-testid="snap-endpoint"
        cx={x}
        cy={y}
        r={RING_RADIUS_PX * cmPerPx}
        className={styles.snapRing}
        strokeWidth={RING_STROKE_PX * cmPerPx}
      />
    );
  }
  return (
    <circle
      data-testid="snap-grid"
      cx={x}
      cy={y}
      r={GRID_DOT_PX * cmPerPx}
      className={styles.snapDot}
    />
  );
}
