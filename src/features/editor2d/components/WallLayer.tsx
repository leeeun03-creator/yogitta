import { FLOOR_PLAN_COLORS } from "@/shared/constants/colors2d";
import { JOINT_RADIUS_PX, JOINT_STROKE_PX } from "@/shared/constants/floorPlan";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { Point, Wall } from "@/shared/types";
import { toSvgPoints } from "../logic/toSvgPoints";
import styles from "./FloorPlan.module.css";

type WallLayerProps = {
  walls: readonly Wall[];
  draft: readonly Point[]; // 그리는 중인 점 (마지막에 커서를 이어 미리보기)
  cursor: Point | null; // 붙을 커서 위치
  erasing: { from: Point; to: Point } | null; // 지우개로 지울 선분
  cmPerPx: number;
};

/** 벽(두께 12cm, 끝 각지게)과 연결점, 그리는 중인 미리보기 선 (yogitta-design 6장). */
export function WallLayer({ walls, draft, cursor, erasing, cmPerPx }: WallLayerProps) {
  const preview = cursor && draft.length > 0 ? [...draft, cursor] : draft;
  const jointRadius = JOINT_RADIUS_PX * cmPerPx;
  return (
    <g strokeLinecap="square" strokeLinejoin="miter" fill="none">
      {walls.map((wall) => (
        <WallShape key={wall.id} wall={wall} jointRadius={jointRadius} cmPerPx={cmPerPx} />
      ))}
      {erasing && (
        <line
          data-testid="erasing"
          x1={erasing.from.x}
          y1={erasing.from.y}
          x2={erasing.to.x}
          y2={erasing.to.y}
          className={styles.erasing}
          strokeWidth={WALL_THICKNESS_CM}
        />
      )}
      {preview.length > 0 && (
        <polyline
          data-testid="draft"
          points={toSvgPoints(preview)}
          className={styles.draft}
          stroke={FLOOR_PLAN_COLORS.wall}
          strokeWidth={WALL_THICKNESS_CM}
          strokeDasharray={`${WALL_THICKNESS_CM} ${WALL_THICKNESS_CM}`}
        />
      )}
    </g>
  );
}

type WallShapeProps = { wall: Wall; jointRadius: number; cmPerPx: number };

/** 벽 하나: 닫힌 벽은 polygon, 열린 벽은 polyline + 점마다 연결점. */
function WallShape({ wall, jointRadius, cmPerPx }: WallShapeProps) {
  const Shape = wall.closed ? "polygon" : "polyline";
  return (
    <g data-testid="wall" data-points={toSvgPoints(wall.points)}>
      <Shape
        points={toSvgPoints(wall.points)}
        stroke={FLOOR_PLAN_COLORS.wall}
        strokeWidth={WALL_THICKNESS_CM}
      />
      {wall.points.map((point, index) => (
        <circle
          key={index}
          data-testid="joint"
          cx={point.x}
          cy={point.y}
          r={jointRadius}
          className={styles.joint}
          stroke={FLOOR_PLAN_COLORS.wall}
          strokeWidth={JOINT_STROKE_PX * cmPerPx}
        />
      ))}
    </g>
  );
}
