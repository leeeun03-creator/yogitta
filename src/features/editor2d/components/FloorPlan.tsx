import { useRef } from "react";
import { formatMeters } from "@/features/spaces";
import type { Floor, Wall } from "@/shared/types";
import { useFloorPlanInput } from "../hooks/useFloorPlanInput";
import { FloorDimensions } from "./FloorDimensions";
import { FloorGrid } from "./FloorGrid";
import { SnapIndicator } from "./SnapIndicator";
import { WallLayer } from "./WallLayer";
import styles from "./FloorPlan.module.css";

type FloorPlanProps = { floor: Floor; walls: readonly Wall[] };

/** 편집 모드의 2D 평면도. 바닥·격자·치수·벽을 그리고, 줌·이동과 그리기 도구를 받는다. */
export function FloorPlan({ floor, walls }: FloorPlanProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const input = useFloorPlanInput(wrapperRef, floor, walls);
  const { tool, box } = input;
  const labels = { width: `${formatMeters(floor.w)} m`, depth: `${formatMeters(floor.h)} m` };

  return (
    <div
      ref={wrapperRef}
      className={tool === "select" ? styles.wrapper : `${styles.wrapper} ${styles.drawing}`}
      tabIndex={0}
      aria-label="2D 평면도 보기: 휠·+/-로 줌, 끌기·방향키로 이동, 0으로 처음 보기"
      {...input.handlers}
    >
      <svg
        className={styles.svg}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        role="img"
        aria-label={`2D 평면도, 바닥 ${labels.width} × ${labels.depth}, 벽 ${walls.length}개`}
      >
        {/* 선·글자는 cm 좌표 안에 있어서, 화면에서 같은 px로 보이게 1px = cmPerPx로 그린다 */}
        <FloorGrid floor={floor} lineWidth={box.cmPerPx} />
        <WallLayer
          walls={walls}
          draft={input.draft}
          cursor={input.previewCursor}
          erasing={input.erasing}
          cmPerPx={box.cmPerPx}
        />
        <SnapIndicator cursor={input.cursor} cmPerPx={box.cmPerPx} />
        <FloorDimensions floor={floor} labels={labels} cmPerPx={box.cmPerPx} />
      </svg>
    </div>
  );
}
