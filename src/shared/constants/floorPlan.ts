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

/** 점·선분을 누른 것으로 보는 화면 거리 (px). 연속선 닫기, 지우개(T3-6). */
export const POINT_HIT_PX = 8;

/** 그리는 점이 기존 벽 점에 붙는 화면 거리 (px). 줌과 상관없이 같다. */
export const SNAP_ENDPOINT_PX = 12;

/** 커서가 붙을 곳 표시 (px): 벽 점이면 고리, 격자면 점. */
export const SNAP_RING_RADIUS_PX = 9; // 붙는 거리(12px)보다 조금 작게
export const SNAP_RING_STROKE_PX = 2;
export const SNAP_GRID_DOT_PX = 3;

/** 그리는 동안 길이 표시 (px). 글자 크기는 치수 글자와 같다. */
export const LENGTH_LABEL_GAP_PX = 6; // 벽 가장자리에서 글자 상자까지
export const LENGTH_LABEL_HALO_PX = 4; // 벽·격자 위에서도 읽히게 두르는 바탕색 테두리
export const LENGTH_LABEL_CHAR_EM = 0.6; // 글자 하나의 폭 어림 (글자 크기 배수)

/** 터치로 끄는 동안 손가락 위에 뜨는 돋보기 (px). */
export const LOUPE_SIZE_PX = 120; // 지름
export const LOUPE_ZOOM = 2; // 지금 2D 평면도보다 몇 배 크게
export const LOUPE_LIFT_PX = 100; // 손가락에서 돋보기 가운데까지 (손가락에 가리지 않게)
export const LOUPE_MARGIN_PX = 8; // 2D 평면도 가장자리와 돋보기 사이

/** 2D 평면도의 가구 (px, yogitta-design 6장). 줌과 상관없이 화면에서 같은 크기다. */
export const BOX_STROKE_PX = 1.5;
export const BOX_DASH_PX = [5, 4] as const; // 보관함 점선 (선, 틈)
export const BOX_CORNER_PX = 6;
export const BOX_FRONT_PX = { width: 12, height: 7 } as const; // 정면 가장자리 밖 삼각형
export const BOX_LABEL_MIN_PX = 12; // 이보다 작아야 들어가는 이름은 숨긴다 (최소 글자 크기)
export const BOX_LABEL_PADDING_PX = 4; // 이름과 가구 가장자리 사이
export const BOX_SELECTED_STROKE_PX = 2.5; // 고른 가구 테두리 (강조색, 실선)
export const SELECTED_LABEL_HEIGHT_PX = 30; // 고른 가구 이름 알약 높이
export const SELECTED_LABEL_GAP_PX = 50; // 가구 가장자리와 이름 알약 사이 (회전 핸들 자리를 둔다)

/** 고른 가구의 회전 핸들 (px, 시안 04): 정면 반대쪽 가장자리에서 선을 긋고 끝에 흰 원. 누르면 90도 돈다. */
export const ROTATE_HANDLE_OFFSET_PX = 36; // 가구 가장자리에서 원 가운데까지
export const ROTATE_HANDLE_RADIUS_PX = 7;
export const ROTATE_HANDLE_STROKE_PX = 2;
export const ROTATE_HANDLE_HIT_PX = 22; // 누른 것으로 보는 거리 (44px 터치 영역)
export const HANGUL_CHAR_EM = 1; // 한글 글자 하나의 폭 어림 (글자 크기 배수)
export const SPACE_CHAR_EM = 0.3; // 띄어쓰기 폭 어림

/** 2D 평면도에 잠깐 뜨는 안내가 떠 있는 시간 (ms). 예) 겹치는 자리에 가구를 놓거나 벽을 그으려 할 때. */
export const PLAN_NOTICE_MS = 2500;

/** 구역 선 (px). 벽보다 얇은 점선이라 벽과 헷갈리지 않는다. */
export const ROOM_LINE_WIDTH_PX = 2;
export const ROOM_LINE_DASH_PX = 6;
