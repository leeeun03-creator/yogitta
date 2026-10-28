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

/** 점·선분을 누른 것으로 보는 화면 거리 (px). 연속선 닫기, 지우개(T3-6). */
export const POINT_HIT_PX = 8;

/** 그리는 점이 기존 벽 점에 붙는 화면 거리 (px). 줌과 상관없이 같다. */
export const SNAP_ENDPOINT_PX = 12;

/** 그리는 동안 길이 표시 (px). 글자 크기는 치수 글자와 같다. */
export const LENGTH_LABEL_GAP_PX = 6; // 벽 가장자리에서 글자 상자까지
export const LENGTH_LABEL_HALO_PX = 4; // 벽·격자 위에서도 읽히게 두르는 바탕색 테두리
export const LENGTH_LABEL_CHAR_EM = 0.6; // 글자 하나의 폭 어림 (글자 크기 배수)

/** 터치로 끄는 동안 손가락 위에 뜨는 돋보기 (px). */
export const LOUPE_SIZE_PX = 120; // 지름
export const LOUPE_ZOOM = 2; // 지금 2D 평면도보다 몇 배 크게
export const LOUPE_LIFT_PX = 100; // 손가락에서 돋보기 가운데까지 (손가락에 가리지 않게)
export const LOUPE_MARGIN_PX = 8; // 2D 평면도 가장자리와 돋보기 사이
