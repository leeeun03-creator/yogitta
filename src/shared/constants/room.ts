/** 구역 이름 최대 글자 수. 구역 칩이 한 줄에 들어가게 한다 (T5). */
export const ROOM_NAME_MAX_LENGTH = 10;
/** 바닥을 구획으로 나눌 때 쓰는 격자 크기 (cm). 벽 끝점이 붙는 격자 스냅과 같아 경계가 어긋나지 않는다. */
export const ROOM_GRID_CM = 10;
/** 벽·구역 선이 지나는 격자를 찾을 때 선 위를 짚어 가는 간격 (cm). 격자보다 충분히 잘게 해 건너뛰는 격자가 없게 한다. */
export const ROOM_LINE_STEP_CM = 1;
