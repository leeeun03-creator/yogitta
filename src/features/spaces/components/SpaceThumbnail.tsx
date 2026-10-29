import { useMemo } from "react";
import { FACE_SHADE, SCENE_COLORS } from "@/shared/constants/colors3d";
import { THUMBNAIL_HEIGHT_PX, THUMBNAIL_WIDTH_PX } from "@/shared/constants/spaceThumbnail";
import { shadeColor } from "@/shared/lib/shadeColor";
import { toSvgPoints } from "@/shared/lib/toSvgPoints";
import type { Space } from "@/shared/types";
import { spaceThumbnail } from "../logic/spaceThumbnail";
import styles from "./SpaceList.module.css";

const EDGE_WIDTH_PX = 0.75; // 썸네일 모서리 선 (작은 그림이라 가늘게)

/**
 * 공간 썸네일: 바닥·벽을 비스듬히 위에서 본 작은 그림 (시안 01, 76 × 56). 3D 공간과 같은 색·면 음영이다.
 * 공간 이름이 옆에 있어 화면 읽기 프로그램은 건너뛴다.
 */
export function SpaceThumbnail({ space }: { space: Pick<Space, "floor" | "walls"> }) {
  const { floor, walls } = space;
  const thumbnail = useMemo(() => spaceThumbnail({ floor, walls }), [floor, walls]);
  return (
    <svg
      className={styles.thumbnail}
      data-testid="space-thumbnail"
      viewBox={`0 0 ${THUMBNAIL_WIDTH_PX} ${THUMBNAIL_HEIGHT_PX}`}
      width={THUMBNAIL_WIDTH_PX}
      height={THUMBNAIL_HEIGHT_PX}
      aria-hidden="true"
    >
      <polygon
        points={toSvgPoints(thumbnail.floor)}
        fill={SCENE_COLORS.floor}
        stroke={SCENE_COLORS.floorGrid}
        strokeWidth={EDGE_WIDTH_PX}
        strokeLinejoin="round"
      />
      {thumbnail.walls.map((wall, index) => (
        <polygon
          key={index}
          data-testid="thumbnail-wall"
          points={toSvgPoints(wall.points)}
          fill={shadeColor(SCENE_COLORS.wall, FACE_SHADE[wall.face])}
          stroke={SCENE_COLORS.edge}
          strokeWidth={EDGE_WIDTH_PX}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
