import { DIMENSION_FONT_PX, DIMENSION_GAP_PX } from "@/shared/constants/floorPlan";
import type { Floor } from "@/shared/types";
import styles from "./FloorPlan.module.css";

type FloorDimensionsProps = {
  floor: Floor;
  labels: { width: string; depth: string }; // "6.0 m"
  cmPerPx: number;
};

/** 바닥 위쪽 가로 치수와 왼쪽 세로 치수. 바닥 크기와 상관없이 화면에서 14px로 보인다. */
export function FloorDimensions({ floor, labels, cmPerPx }: FloorDimensionsProps) {
  const gap = DIMENSION_GAP_PX * cmPerPx;
  const leftX = -gap;
  const leftY = floor.h / 2;
  return (
    <g className={styles.dimension} fontSize={DIMENSION_FONT_PX * cmPerPx} textAnchor="middle">
      <text x={floor.w / 2} y={-gap}>
        {labels.width}
      </text>
      <text x={leftX} y={leftY} transform={`rotate(-90 ${leftX} ${leftY})`}>
        {labels.depth}
      </text>
    </g>
  );
}
