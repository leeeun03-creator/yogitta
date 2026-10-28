import { useRef } from "react";
import { formatMeters } from "@/features/spaces";
import { FLOOR_PLAN_COLORS } from "@/shared/constants/colors2d";
import { DIMENSION_FONT_PX, DIMENSION_GAP_PX } from "@/shared/constants/floorPlan";
import type { Floor } from "@/shared/types";
import { usePanZoom } from "../hooks/usePanZoom";
import { gridLines } from "../logic/gridLines";
import styles from "./FloorPlan.module.css";

type FloorPlanProps = { floor: Floor };

/** 편집 모드의 2D 평면도. 바닥(cm)에 50cm 격자와 치수를 그리고, 줌·이동할 수 있다. */
export function FloorPlan({ floor }: FloorPlanProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { box, handlers } = usePanZoom(wrapperRef, floor);
  // 선·글자는 cm 좌표 안에 있으므로, 화면에서 같은 px로 보이게 1px = cmPerPx로 바꾼다
  const px = (value: number) => value * box.cmPerPx;
  const widthLabel = `${formatMeters(floor.w)} m`;
  const depthLabel = `${formatMeters(floor.h)} m`;
  const labelX = -px(DIMENSION_GAP_PX);
  const labelY = floor.h / 2;

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      tabIndex={0}
      aria-label="2D 평면도 보기: 휠·+/-로 줌, 끌기·방향키로 이동, 0으로 처음 보기"
      {...handlers}
    >
      <svg
        className={styles.svg}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        role="img"
        aria-label={`2D 평면도, 바닥 ${widthLabel} × ${depthLabel}`}
      >
        <rect
          data-testid="floor"
          x={0}
          y={0}
          width={floor.w}
          height={floor.h}
          className={styles.paper}
          stroke={FLOOR_PLAN_COLORS.floorBorder}
          strokeWidth={px(1)}
        />
        <g data-testid="grid" stroke={FLOOR_PLAN_COLORS.grid} strokeWidth={px(1)}>
          {gridLines(floor.w).map((x) => (
            <line key={`x${x}`} x1={x} y1={0} x2={x} y2={floor.h} />
          ))}
          {gridLines(floor.h).map((y) => (
            <line key={`y${y}`} x1={0} y1={y} x2={floor.w} y2={y} />
          ))}
        </g>
        <g className={styles.dimension} fontSize={px(DIMENSION_FONT_PX)} textAnchor="middle">
          <text x={floor.w / 2} y={-px(DIMENSION_GAP_PX)}>
            {widthLabel}
          </text>
          <text x={labelX} y={labelY} transform={`rotate(-90 ${labelX} ${labelY})`}>
            {depthLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
