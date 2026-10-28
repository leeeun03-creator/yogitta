import {
  LOUPE_LIFT_PX,
  LOUPE_MARGIN_PX,
  LOUPE_SIZE_PX,
  LOUPE_ZOOM,
} from "@/shared/constants/floorPlan";
import type { Floor, Point, Wall } from "@/shared/types";
import type { ViewBox } from "../logic/fitViewBox";
import { loupePlacement } from "../logic/loupePlacement";
import { screenToCm } from "../logic/screenToCm";
import { FloorScene, type SceneState } from "./FloorScene";
import styles from "./FloorPlan.module.css";

type LoupeProps = {
  finger: Point | null; // 손가락 자리 (px)
  box: ViewBox;
  floor: Floor;
  walls: readonly Wall[];
  scene: SceneState;
};

/**
 * 터치로 끄는 동안 손가락 위에 뜨는 돋보기. 손가락 아래(붙을 곳이 있으면 그 점)를 LOUPE_ZOOM배로 보여준다.
 * 그림만 보여주고 누르기는 받지 않으므로, 찍히는 좌표는 손가락 자리 그대로다.
 */
export function Loupe({ finger, box, floor, walls, scene }: LoupeProps) {
  if (!finger) return null;
  const viewport = { width: box.width / box.cmPerPx, height: box.height / box.cmPerPx };
  const at = loupePlacement(finger, viewport, {
    size: LOUPE_SIZE_PX,
    lift: LOUPE_LIFT_PX,
    margin: LOUPE_MARGIN_PX,
  });
  const center = scene.cursor?.point ?? screenToCm(finger, box);
  const cmPerPx = box.cmPerPx / LOUPE_ZOOM;
  const span = LOUPE_SIZE_PX * cmPerPx;
  return (
    <div
      data-testid="loupe"
      className={styles.loupe}
      style={{ left: at.x, top: at.y, width: LOUPE_SIZE_PX, height: LOUPE_SIZE_PX }}
      aria-hidden="true"
    >
      <svg viewBox={`${center.x - span / 2} ${center.y - span / 2} ${span} ${span}`}>
        <FloorScene floor={floor} walls={walls} scene={scene} cmPerPx={cmPerPx} />
      </svg>
    </div>
  );
}
