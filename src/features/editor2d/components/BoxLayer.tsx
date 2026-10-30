import { BOX_PLAN_COLORS } from "@/shared/constants/colors2d";
import {
  BOX_CORNER_PX,
  BOX_DASH_PX,
  BOX_FRONT_PX,
  BOX_SELECTED_STROKE_PX,
  BOX_STROKE_PX,
  ROTATE_HANDLE_OFFSET_PX,
  ROTATE_HANDLE_RADIUS_PX,
  ROTATE_HANDLE_STROKE_PX,
} from "@/shared/constants/floorPlan";
import { BED_HEADBOARD_CM, BOX_ROTATION_STEP, FULL_TURN } from "@/shared/constants/furniture";
import type { Box } from "@/shared/types";
import type { BoxDraft } from "../hooks/useBoxTool";
import { boxLabelFont } from "../logic/boxLabelFont";
import styles from "./FloorPlan.module.css";

type BoxLayerProps = {
  boxes: readonly Box[];
  draft: BoxDraft | null; // 가구 도구로 끄는 중인 사각형 (겹치면 삭제색)
  selected: string | null; // 고른 가구 (강조색 테두리 + 회전 핸들)
  erasing: string | null; // 지우개로 지울 가구 (삭제색)
  overlapping: ReadonlySet<string>; // 벽·다른 가구와 겹쳐 있는 가구 (삭제색 테두리)
  cmPerPx: number;
};

/** 가구 모양: 보통, 고름, 지우개로 지울 것, 벽·다른 가구와 겹쳐 있음. */
type BoxLook = "normal" | "selected" | "erasing" | "overlapping";

/**
 * 가구: 연한 바탕 + 실선 테두리(보관함만 점선), 정면 가장자리 밖 삼각형, 가운데 이름. 침대는 정면 반대쪽에 머리판 띠.
 * 고른 가구는 찾은 칸 바탕 + 강조색 실선 테두리 + 정면 반대쪽 회전 핸들 (시안 04, yogitta-design 6장).
 */
export function BoxLayer(props: BoxLayerProps) {
  const { boxes, draft, selected, erasing, overlapping, cmPerPx } = props;
  const lookOf = (id: string): BoxLook => {
    if (id === erasing) return "erasing";
    if (id === selected) return "selected";
    return overlapping.has(id) ? "overlapping" : "normal";
  };
  return (
    <g>
      {boxes.map((box) => (
        <BoxShape key={box.id} box={box} look={lookOf(box.id)} cmPerPx={cmPerPx} />
      ))}
      {draft && (
        <rect
          data-testid="box-draft"
          x={draft.center.x - draft.w / 2}
          y={draft.center.y - draft.d / 2}
          width={draft.w}
          height={draft.d}
          rx={BOX_CORNER_PX * cmPerPx}
          data-blocked={draft.isBlocked}
          className={draft.isBlocked ? `${styles.draft} ${styles.blockedDraft}` : styles.draft}
          fill={BOX_PLAN_COLORS.fill}
          stroke={BOX_PLAN_COLORS.stroke}
          strokeWidth={BOX_STROKE_PX * cmPerPx}
        />
      )}
    </g>
  );
}

type BoxShapeProps = { box: Box; look: BoxLook; cmPerPx: number };

const BODY_CLASS: Record<BoxLook, string | undefined> = {
  normal: undefined,
  selected: styles.selectedBox,
  erasing: styles.erasingBox,
  overlapping: styles.overlappingBox,
};

/** 가구 하나: 몸통과 이름. 같은 가구인지 테스트에서 알아볼 수 있게 자리·크기·회전을 붙인다. */
function BoxShape({ box, look, cmPerPx }: BoxShapeProps) {
  return (
    <g
      data-testid="box"
      data-box={`${box.x},${box.z},${box.w},${box.d},${box.rotation}`}
      data-type={box.type}
      data-look={look}
      aria-label={box.name}
    >
      <BoxBody box={box} look={look} cmPerPx={cmPerPx} />
      <BoxName box={box} cmPerPx={cmPerPx} />
    </g>
  );
}

/**
 * 가구 몸통: 가운데를 원점으로 돌려 그리고, 정면(돌리기 전 +y 쪽) 가장자리 밖에 삼각형을 단다.
 * 점선 테두리는 종류를 아직 안 고른 보관함만이다 (종류를 고르면 실선).
 */
function BoxBody({ box, look, cmPerPx }: BoxShapeProps) {
  const front = { half: (BOX_FRONT_PX.width / 2) * cmPerPx, height: BOX_FRONT_PX.height * cmPerPx };
  const isPlain = look === "normal";
  const stroke = (isPlain ? BOX_STROKE_PX : BOX_SELECTED_STROKE_PX) * cmPerPx;
  const isDashed = isPlain && box.type === "box";
  return (
    <g transform={`translate(${box.x} ${box.z}) rotate(${box.rotation})`}>
      <rect
        x={-box.w / 2}
        y={-box.d / 2}
        width={box.w}
        height={box.d}
        rx={BOX_CORNER_PX * cmPerPx}
        className={BODY_CLASS[look]}
        fill={BOX_PLAN_COLORS.fill}
        stroke={BOX_PLAN_COLORS.stroke}
        strokeWidth={stroke}
        strokeDasharray={isDashed ? BOX_DASH_PX.map((px) => px * cmPerPx).join(" ") : undefined}
      />
      {box.type === "bed" && <Headboard box={box} inset={stroke / 2} />}
      <path
        data-testid="box-front"
        d={`M ${-front.half} ${box.d / 2} h ${front.half * 2} l ${-front.half} ${front.height} Z`}
        className={look === "selected" ? styles.selectedBoxFront : undefined}
        fill={BOX_PLAN_COLORS.stroke}
      />
      {look === "selected" && <RotateHandle depth={box.d} cmPerPx={cmPerPx} />}
    </g>
  );
}

/**
 * 침대 머리판 띠: 정면 반대쪽(돌리기 전 -y) 가장자리를 따라 머리판 두께만큼 칠한다 (시안 04).
 * 테두리 안쪽으로 inset만큼 들여 그려 고른 가구의 강조색 테두리를 덮지 않는다.
 */
function Headboard({ box, inset }: { box: Box; inset: number }) {
  return (
    <rect
      data-testid="bed-headboard"
      x={-box.w / 2 + inset}
      y={-box.d / 2 + inset}
      width={Math.max(box.w - inset * 2, 0)}
      height={Math.max(Math.min(BED_HEADBOARD_CM, box.d) - inset, 0)}
      fill={BOX_PLAN_COLORS.stroke}
    />
  );
}

/** 회전 핸들 (시안 04): 정면 반대쪽(돌리기 전 -y) 가장자리에서 선을 긋고 끝에 흰 원. 가구와 같이 돈다. */
function RotateHandle({ depth, cmPerPx }: { depth: number; cmPerPx: number }) {
  const edge = -depth / 2;
  const center = edge - ROTATE_HANDLE_OFFSET_PX * cmPerPx;
  const radius = ROTATE_HANDLE_RADIUS_PX * cmPerPx;
  return (
    <g
      data-testid="rotate-handle"
      className={styles.rotateHandle}
      strokeWidth={ROTATE_HANDLE_STROKE_PX * cmPerPx}
    >
      <line x1={0} y1={edge} x2={0} y2={center + radius} />
      <circle cx={0} cy={center} r={radius} />
    </g>
  );
}

/** 가구 이름: 가구의 가로 방향을 따라 쓰되 거꾸로 읽히지 않게 0도 또는 -90도로만 눕힌다. 안 들어가면 숨긴다. */
function BoxName({ box, cmPerPx }: Omit<BoxShapeProps, "look">) {
  const font = boxLabelFont(box.name, { along: box.w, across: box.d }, cmPerPx);
  if (font === null) return null;
  const angle = box.rotation % (FULL_TURN / 2) === 0 ? 0 : -BOX_ROTATION_STEP;
  return (
    <text
      x={box.x}
      y={box.z}
      transform={`rotate(${angle} ${box.x} ${box.z})`}
      className={styles.boxLabel}
      fontSize={font}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {box.name}
    </text>
  );
}
