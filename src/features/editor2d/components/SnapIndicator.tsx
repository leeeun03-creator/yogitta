import {
  SNAP_GRID_DOT_PX,
  SNAP_RING_RADIUS_PX,
  SNAP_RING_STROKE_PX,
} from "@/shared/constants/floorPlan";
import type { Snapped } from "../hooks/useSnapper";
import styles from "./FloorPlan.module.css";

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
        r={SNAP_RING_RADIUS_PX * cmPerPx}
        className={styles.snapRing}
        strokeWidth={SNAP_RING_STROKE_PX * cmPerPx}
      />
    );
  }
  return (
    <circle
      data-testid="snap-grid"
      cx={x}
      cy={y}
      r={SNAP_GRID_DOT_PX * cmPerPx}
      className={styles.snapDot}
    />
  );
}
