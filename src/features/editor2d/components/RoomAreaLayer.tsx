import type { Rect, RoomArea } from "@/features/spaces";
import { ROOM_FILL_OPACITY, ROOM_PREVIEW_OPACITY } from "@/shared/constants/colors2d";

type RoomAreaLayerProps = {
  areas: readonly RoomArea[];
  selected: string | null; // 고른 구역 (진하게 칠하고 이름은 강조색)
  preview: { rects: Rect[]; color: string } | null; // 누르면 새 구역이 될 구획 (다음 구역 색으로 옅게)
};

/** 사각형들을 SVG 경로 하나로 잇는다 (구역 하나 = path 하나). */
const toPath = (rects: readonly Rect[]) =>
  rects.map(({ x, y, w, h }) => `M${x} ${y}h${w}v${h}h${-w}z`).join("");

/**
 * 구역: 구획을 파스텔 색으로 칠한다 (yogitta-design 6장). 이름은 벽 위에 보이게 `RoomLabelLayer`가 따로 쓴다.
 * 마우스를 올리거나 눌러 이름 입력칸이 뜬 이름 없는 구획은 새 구역이 받을 색으로 옅게 칠한다.
 */
export function RoomAreaLayer({ areas, selected, preview }: RoomAreaLayerProps) {
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
      {preview && (
        <path
          data-testid="part-preview"
          d={toPath(preview.rects)}
          fill={preview.color}
          fillOpacity={ROOM_PREVIEW_OPACITY}
        />
      )}
    </g>
  );
}
