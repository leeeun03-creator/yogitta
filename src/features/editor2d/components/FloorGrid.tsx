import { FLOOR_PLAN_COLORS } from "@/shared/constants/colors2d";
import type { Floor } from "@/shared/types";
import { gridLines } from "../logic/gridLines";
import styles from "./FloorPlan.module.css";

type FloorGridProps = { floor: Floor; lineWidth: number }; // lineWidth: cm (화면 1px에 해당)

/** 바닥 사각형과 50cm 격자선 (yogitta-design 6장). */
export function FloorGrid({ floor, lineWidth }: FloorGridProps) {
  return (
    <>
      <rect
        data-testid="floor"
        x={0}
        y={0}
        width={floor.w}
        height={floor.h}
        className={styles.paper}
        stroke={FLOOR_PLAN_COLORS.floorBorder}
        strokeWidth={lineWidth}
      />
      <g data-testid="grid" stroke={FLOOR_PLAN_COLORS.grid} strokeWidth={lineWidth}>
        {gridLines(floor.w).map((x) => (
          <line key={`x${x}`} x1={x} y1={0} x2={x} y2={floor.h} />
        ))}
        {gridLines(floor.h).map((y) => (
          <line key={`y${y}`} x1={0} y1={y} x2={floor.w} y2={y} />
        ))}
      </g>
    </>
  );
}
