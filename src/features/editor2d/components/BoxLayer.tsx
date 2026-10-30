import { BOX_PLAN_COLORS } from "@/shared/constants/colors2d";
import {
  BOX_CORNER_PX,
  BOX_DASH_PX,
  BOX_FRONT_PX,
  BOX_STROKE_PX,
} from "@/shared/constants/floorPlan";
import { BOX_ROTATION_STEP, FULL_TURN } from "@/shared/constants/furniture";
import type { Box } from "@/shared/types";
import type { BoxPlacement } from "../logic/boxFromDrag";
import { boxLabelFont } from "../logic/boxLabelFont";
import styles from "./FloorPlan.module.css";

type BoxLayerProps = {
  boxes: readonly Box[];
  draft: BoxPlacement | null; // 가구 도구로 끄는 중인 사각형
  cmPerPx: number;
};

/** 가구: 보관함은 연한 바탕 + 점선 테두리, 정면 가장자리 밖 삼각형, 가운데 이름 (시안 04, yogitta-design 6장). */
export function BoxLayer({ boxes, draft, cmPerPx }: BoxLayerProps) {
  return (
    <g>
      {boxes.map((box) => (
        <BoxShape key={box.id} box={box} cmPerPx={cmPerPx} />
      ))}
      {draft && (
        <rect
          data-testid="box-draft"
          x={draft.center.x - draft.w / 2}
          y={draft.center.y - draft.d / 2}
          width={draft.w}
          height={draft.d}
          rx={BOX_CORNER_PX * cmPerPx}
          className={styles.draft}
          fill={BOX_PLAN_COLORS.fill}
          stroke={BOX_PLAN_COLORS.stroke}
          strokeWidth={BOX_STROKE_PX * cmPerPx}
        />
      )}
    </g>
  );
}

type BoxShapeProps = { box: Box; cmPerPx: number };

/**
 * 가구 하나. 가운데를 원점으로 돌려 그리고, 정면(돌리기 전 +y 쪽)에 삼각형을 단다.
 * 이름은 가구의 가로 방향을 따라 쓰되 거꾸로 읽히지 않게 0도 또는 -90도로만 눕힌다.
 */
function BoxShape({ box, cmPerPx }: BoxShapeProps) {
  const front = { half: (BOX_FRONT_PX.width / 2) * cmPerPx, height: BOX_FRONT_PX.height * cmPerPx };
  const font = boxLabelFont(box.name, { along: box.w, across: box.d }, cmPerPx);
  const labelAngle = box.rotation % (FULL_TURN / 2) === 0 ? 0 : -BOX_ROTATION_STEP;
  return (
    <g
      data-testid="box"
      data-box={`${box.x},${box.z},${box.w},${box.d},${box.rotation}`}
      aria-label={box.name}
    >
      <g transform={`translate(${box.x} ${box.z}) rotate(${box.rotation})`}>
        <rect
          x={-box.w / 2}
          y={-box.d / 2}
          width={box.w}
          height={box.d}
          rx={BOX_CORNER_PX * cmPerPx}
          fill={BOX_PLAN_COLORS.fill}
          stroke={BOX_PLAN_COLORS.stroke}
          strokeWidth={BOX_STROKE_PX * cmPerPx}
          strokeDasharray={BOX_DASH_PX.map((px) => px * cmPerPx).join(" ")}
        />
        <path
          data-testid="box-front"
          d={`M ${-front.half} ${box.d / 2} h ${front.half * 2} l ${-front.half} ${front.height} Z`}
          fill={BOX_PLAN_COLORS.stroke}
        />
      </g>
      {font !== null && (
        <text
          x={box.x}
          y={box.z}
          transform={`rotate(${labelAngle} ${box.x} ${box.z})`}
          className={styles.boxLabel}
          fontSize={font}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {box.name}
        </text>
      )}
    </g>
  );
}
