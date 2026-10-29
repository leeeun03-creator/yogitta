import type { RoomArea } from "@/features/spaces";
import { ROOM_FILL_OPACITY } from "@/shared/constants/colors2d";

type RoomAreaLayerProps = {
  areas: readonly RoomArea[];
  selected: string | null; // 고른 구역 (진하게 칠하고 이름은 강조색)
};

/** 사각형들을 SVG 경로 하나로 잇는다 (구역 하나 = path 하나). */
const toPath = (rects: RoomArea["rects"]) =>
  rects.map(({ x, y, w, h }) => `M${x} ${y}h${w}v${h}h${-w}z`).join("");

/** 구역: 구획을 파스텔 색으로 칠한다 (yogitta-design 6장). 이름은 벽 위에 보이게 `RoomLabelLayer`가 따로 쓴다. */
export function RoomAreaLayer({ areas, selected }: RoomAreaLayerProps) {
  return (
    <g>
      {areas.map((area) => (
        <path
          key={area.room}
          data-testid="room-area"
          data-room={area.room}
          d={toPath(area.rects)}
          fill={area.color}
          fillOpacity={area.room === selected ? 1 : ROOM_FILL_OPACITY}
        />
      ))}
    </g>
  );
}
