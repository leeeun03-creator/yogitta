/** 2D 평면도 화면 크기 (px). 바닥 둘레에 치수 글자가 들어갈 여백을 둔다. */
export const FLOOR_PLAN_MARGIN_PX = 48;
export const DIMENSION_FONT_PX = 14; // 치수 글자 (yogitta-design 6장)
export const DIMENSION_GAP_PX = 16; // 바닥 가장자리와 치수 글자 사이

/** 2D 평면도 줌 (1 = 바닥이 화면에 꽉 차게). */
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 8;
export const ZOOM_STEP = 1.2; // 휠 한 칸·키보드 +/- 한 번
export const KEYBOARD_PAN_PX = 40; // 방향키 한 번에 옮기는 화면 거리

/** 벽 연결점 (yogitta-design 6장: 흰 원 + 갈색 테두리). */
export const JOINT_RADIUS_PX = 4;
export const JOINT_STROKE_PX = 2;

/** 누른 뒤 이만큼(px) 안에서 떼면 끌기가 아니라 "누르기"로 본다. */
export const TAP_MOVE_PX = 5;
