import type { RoomArea } from "@/features/spaces";
import { DIMENSION_FONT_PX, LENGTH_LABEL_HALO_PX } from "@/shared/constants/floorPlan";
import styles from "./FloorPlan.module.css";

type RoomLabelLayerProps = {
  areas: readonly RoomArea[];
  selected: string | null; // 고른 구역 (이름을 강조색으로)
  cmPerPx: number;
};

/** 구역 이름: 구역 기준점(구획을 누른 자리)에 14px 글자. 벽·구역 선 위에서도 읽히게 맨 위에 그린다. */
export function RoomLabelLayer({ areas, selected, cmPerPx }: RoomLabelLayerProps) {
  return (
    <g>
      {areas.map((area) => (
        <text
          key={area.room}
          data-testid="room-label"
          x={area.label.x}
          y={area.label.y}
          className={area.room === selected ? styles.selectedRoomLabel : styles.roomLabel}
          fontSize={DIMENSION_FONT_PX * cmPerPx}
          strokeWidth={LENGTH_LABEL_HALO_PX * cmPerPx}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {area.room}
        </text>
      ))}
    </g>
  );
}
