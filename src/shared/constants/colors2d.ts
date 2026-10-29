/** 2D 평면도 색 (yogitta-design 6장). 토큰에 없는 2D 전용 색은 여기 한 곳에만 둔다. */
export const FLOOR_PLAN_COLORS = {
  grid: "#F0E3D0", // 50cm 격자선
  floorBorder: "#D9C3A5", // 바닥 테두리
  wall: "#6E5236", // 벽 (T3)
} as const;

/** 구역 색 (yogitta-design 6장). 구역 목록 순서대로 돌려 쓴다. 2D 평면도·3D 미리보기 바닥이 같이 쓴다. */
export const ROOM_COLORS = [
  "#F9D5C2", // 복숭아
  "#CDEBD9", // 민트
  "#CFE3F3", // 하늘
  "#F7E7B4", // 버터
  "#F5CFD6", // 장미
  "#DCE5C8", // 세이지
] as const;
/** 구역 색을 칠할 때 불투명도. 격자선이 비쳐 보이게 한다. */
export const ROOM_FILL_OPACITY = 0.7;
