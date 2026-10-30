import type { FurnitureType } from "@/shared/types";

/** 3D 색 (yogitta-design 5장). 3D에서 쓰는 색은 여기 한 곳에만 둔다. */
export const SCENE_COLORS = {
  floor: "#DCBB91", // 바닥 (마루)
  floorGrid: "#CFA87A", // 바닥 50cm 격자선
  wall: "#F6EAD8", // 벽
  edge: "#9B7A5A", // 모서리 선, 가구 손잡이
  selectedEdge: "#3B2F25", // 고른 가구의 모서리 선: 글자색(--yg-text). 강조색은 찾은 가구에만 쓴다
  mattress: "#F7EFE3", // 침대 매트리스
} as const;

/** 가구 종류별 나무 톤 (yogitta-design 5장). 서랍장은 시안 표에 없어 같은 수납 가구 색을 쓴다. */
export const FURNITURE_COLORS: Record<FurnitureType, string> = {
  cabinet: "#A6754D",
  drawer: "#A6754D",
  shelf: "#A6754D",
  wall: "#A6754D",
  desk: "#B98A5E",
  table: "#B98A5E",
  bed: "#C99A6C",
  box: "#CDB79C",
};

/** 3D 바닥 구역 색의 불투명도. 색은 2D 평면도와 같은 `ROOM_COLORS`이고, 마루색이 비쳐 옅게 보이게 한다. */
export const ROOM_FLOOR_OPACITY = 0.6;

/** 마우스를 올린 가구는 이만큼 밝게 칠한다 (yogitta-design 5장 "호버: 살짝 밝게"). */
export const HOVER_SHADE = 1.1;

/** 면 음영: 윗면 = 기본색, 앞면 86%, 옆면 74% 밝기. */
export const FACE_SHADE = { top: 1, front: 0.86, side: 0.74 } as const;
