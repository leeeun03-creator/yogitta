/** 3D 색 (yogitta-design 5장). 3D에서 쓰는 색은 여기 한 곳에만 둔다. */
export const SCENE_COLORS = {
  floor: "#DCBB91", // 바닥 (마루)
  floorGrid: "#CFA87A", // 바닥 50cm 격자선
  wall: "#F6EAD8", // 벽
  edge: "#9B7A5A", // 모서리 선
} as const;

/** 면 음영: 윗면 = 기본색, 앞면 86%, 옆면 74% 밝기. */
export const FACE_SHADE = { top: 1, front: 0.86, side: 0.74 } as const;
