import { useRef } from "react";
import { formatMeters } from "@/features/spaces";
import type { Floor } from "@/shared/types";
import { usePanZoom } from "../hooks/usePanZoom";
import { FloorDimensions } from "./FloorDimensions";
import { FloorGrid } from "./FloorGrid";
import styles from "./FloorPlan.module.css";

type FloorPlanProps = { floor: Floor };

/** 편집 모드의 2D 평면도. 바닥(cm)에 50cm 격자와 치수를 그리고, 줌·이동할 수 있다. */
export function FloorPlan({ floor }: FloorPlanProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { box, handlers } = usePanZoom(wrapperRef, floor);
  const labels = { width: `${formatMeters(floor.w)} m`, depth: `${formatMeters(floor.h)} m` };

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
        aria-label={`2D 평면도, 바닥 ${labels.width} × ${labels.depth}`}
      >
        {/* 선·글자는 cm 좌표 안에 있어서, 화면에서 같은 px로 보이게 1px = cmPerPx로 그린다 */}
        <FloorGrid floor={floor} lineWidth={box.cmPerPx} />
        <FloorDimensions floor={floor} labels={labels} cmPerPx={box.cmPerPx} />
      </svg>
    </div>
  );
}
