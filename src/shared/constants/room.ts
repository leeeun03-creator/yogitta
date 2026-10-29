/** 구역 이름 최대 글자 수. 구역 칩이 한 줄에 들어가게 한다 (T5). */
export const ROOM_NAME_MAX_LENGTH = 10;
/** 바닥을 구획으로 나눌 때 쓰는 격자 크기 (cm). 벽 끝점이 붙는 격자 스냅과 같아 경계가 어긋나지 않는다. */
export const ROOM_GRID_CM = 10;
/** 벽·구역 선이 지나는 격자를 찾을 때 선 위를 짚어 가는 간격 (cm). 격자보다 충분히 잘게 해 건너뛰는 격자가 없게 한다. */
export const ROOM_LINE_STEP_CM = 1;
/** 구역 선 끝이 벽·바닥 테두리·다른 구역 선에서 이 거리(cm) 안이면 그 위로 이어 붙인다. 손으로 그어도 끝이 딱 닿게 한다. */
export const ROOM_LINE_ATTACH_CM = 30;
/** 끌면서 찍힌 점을 이 간격(cm)보다 가까우면 버린다. 저장할 점 수를 줄인다. */
export const ROOM_LINE_POINT_GAP_CM = 5;
/** 이보다 짧은 구역 선(cm)은 실수로 보고 더하지 않는다. */
export const ROOM_LINE_MIN_CM = 20;

/** 구획을 누르면 그 자리에 뜨는 새 구역 이름 입력칸 (px). */
export const ROOM_POPOVER_WIDTH_PX = 272;
export const ROOM_POPOVER_HEIGHT_PX = 64; // 안내 문구가 없을 때
export const ROOM_POPOVER_GAP_PX = 12; // 누른 자리와 입력칸 사이
export const ROOM_POPOVER_MARGIN_PX = 8; // 2D 평면도 가장자리와 입력칸 사이
