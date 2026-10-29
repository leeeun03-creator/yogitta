import { FLOOR_PLAN_COLORS } from "@/shared/constants/colors2d";
import { ROOM_LINE_DASH_PX, ROOM_LINE_WIDTH_PX } from "@/shared/constants/floorPlan";
import type { Point, RoomLine } from "@/shared/types";
import styles from "./FloorPlan.module.css";

type RoomLineLayerProps = {
  lines: readonly RoomLine[];
  draft: readonly Point[]; // 끄는 중인 구역 선
  erasing: readonly Point[] | null; // 지우개로 지울 구역 선
  cmPerPx: number;
};

const toPath = (points: readonly Point[]) => points.map(({ x, y }) => `${x},${y}`).join(" ");

/** 구역 선 모양: 벽과 같은 색의 얇은 점선 (화면 px 기준). */
const lineStyleOf = (cmPerPx: number) =>
  ({
    fill: "none",
    stroke: FLOOR_PLAN_COLORS.wall,
    strokeWidth: ROOM_LINE_WIDTH_PX * cmPerPx,
    strokeDasharray: `${ROOM_LINE_DASH_PX * cmPerPx} ${ROOM_LINE_DASH_PX * cmPerPx}`,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

/** 구역 선: 벽보다 얇은 점선 (화면 2px). 3D에는 서지 않고 바닥을 구획으로 나누는 표시다. 지울 선은 삭제 색 실선. */
export function RoomLineLayer({ lines, draft, erasing, cmPerPx }: RoomLineLayerProps) {
  const lineStyle = lineStyleOf(cmPerPx);
  return (
    <g>
      {lines.map((line) => (
        <polyline
          key={line.id}
          data-testid="room-line"
          data-points={toPath(line.points)}
          points={toPath(line.points)}
          {...lineStyle}
        />
      ))}
      {draft.length > 1 && (
        <polyline
          data-testid="room-line-draft"
          points={toPath(draft)}
          className={styles.draft}
          {...lineStyle}
        />
      )}
      {erasing && (
        <polyline
          data-testid="erasing"
          points={toPath(erasing)}
          className={styles.erasing}
          {...lineStyle}
          strokeWidth={ROOM_LINE_WIDTH_PX * 2 * cmPerPx}
          strokeDasharray="none"
        />
      )}
    </g>
  );
}
