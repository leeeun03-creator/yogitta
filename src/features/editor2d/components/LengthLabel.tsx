import { DIMENSION_FONT_PX, LENGTH_LABEL_HALO_PX } from "@/shared/constants/floorPlan";
import type { Measure } from "../logic/draftMeasure";
import styles from "./FloorPlan.module.css";

type LengthLabelProps = { measure: Measure | null; cmPerPx: number };

/** 그리는 동안 지금 길이("1.2 m", 사각형은 "3.0 × 2.5 m"). 줌과 상관없이 화면에서 14px로 보인다. */
export function LengthLabel({ measure, cmPerPx }: LengthLabelProps) {
  if (!measure) return null;
  return (
    <text
      data-testid="length-label"
      x={measure.at.x}
      y={measure.at.y}
      className={styles.lengthLabel}
      fontSize={DIMENSION_FONT_PX * cmPerPx}
      strokeWidth={LENGTH_LABEL_HALO_PX * cmPerPx}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {measure.text}
    </text>
  );
}
