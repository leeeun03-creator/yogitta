import { useRef } from "react";
import { formatMeters } from "@/shared/lib/formatMeters";
import type { Space } from "@/shared/types";
import { useFloorPlanInput } from "../hooks/useFloorPlanInput";
import { FloorDimensions } from "./FloorDimensions";
import { FloorScene } from "./FloorScene";
import { Loupe } from "./Loupe";
import { PlanRoomPopover } from "./PlanRoomPopover";
import styles from "./FloorPlan.module.css";

type FloorPlanProps = { space: Space };

/**
 * 편집 모드의 2D 평면도. 바닥·격자·치수·구역·벽·구역 선과 그리는 동안의 길이 표시·돋보기를 그리고,
 * 줌·이동과 그리기 도구를 받는다. 이름 없는 구획을 누르면 그 자리에 새 구역 이름 입력칸을 띄운다.
 */
export function FloorPlan({ space }: FloorPlanProps) {
  const { floor, walls } = space;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const input = useFloorPlanInput(wrapperRef, space);
  const { tool, box, scene } = input;
  const labels = { width: `${formatMeters(floor.w)} m`, depth: `${formatMeters(floor.h)} m` };

  return (
    // 입력칸은 2D 평면도 밖(형제)에 둬서, 입력칸을 누르거나 글자를 쳐도 줌·이동·그리기가 받지 않게 한다
    <div className={styles.frame}>
      <div
        ref={wrapperRef}
        className={tool === "select" ? styles.wrapper : `${styles.wrapper} ${styles.drawing}`}
        tabIndex={0}
        aria-label="2D 평면도 보기: 휠·+/-로 줌, 끌기·방향키로 이동, 0으로 처음 보기"
        {...input.handlers}
        // 터치를 뗀 뒤 브라우저가 흉내 내는 마우스 누르기가 2D 평면도로 초점을 가져가지 않게 한다
        // (구획을 눌러 뜬 이름 입력칸의 초점을 뺏지 않게). 끌기 뒤처럼 취소할 수 없는 때는 건드리지 않는다
        onTouchEnd={(event) => event.cancelable && event.preventDefault()}
      >
        <svg
          className={styles.svg}
          viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
          role="img"
          aria-label={`2D 평면도, 바닥 ${labels.width} × ${labels.depth}, 벽 ${walls.length}개, 구역 선 ${scene.roomLines.length}개, 가구 ${space.boxes.length}개`}
        >
          {/* 선·글자는 cm 좌표 안에 있어서, 화면에서 같은 px로 보이게 1px = cmPerPx로 그린다 */}
          <FloorScene floor={floor} walls={walls} scene={scene} cmPerPx={box.cmPerPx} />
          <FloorDimensions floor={floor} labels={labels} cmPerPx={box.cmPerPx} />
        </svg>
        <Loupe finger={input.finger} box={box} floor={floor} walls={walls} scene={scene} />
      </div>
      <PlanRoomPopover box={box} onClose={() => wrapperRef.current?.focus()} />
    </div>
  );
}
