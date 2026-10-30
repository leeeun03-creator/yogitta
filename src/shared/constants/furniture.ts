import type { FurnitureType } from "@/shared/types";

/** 가구를 누르기만 해서 놓을 때의 크기와 새 가구의 높이 (cm). PRD 인수 조건 "가구 변신"의 보관함과 같다. */
export const BOX_DEFAULT_SIZE = { w: 60, d: 50, h: 90 } as const;

/** 가구 가로·깊이의 최소값 (cm). 스냅 격자 한 칸이다. */
export const BOX_MIN_SIZE_CM = 10;

/** 가구 높이 최대값 (cm). 실제 벽 높이(240cm)를 넘는 가구는 없다고 본다. */
export const BOX_MAX_HEIGHT_CM = 240;

/** 칸 수를 바꿀 수 있는 가구 종류와 칸 수 범위. 책상·테이블·침대·보관함은 칸이 정해져 있다. */
export const ROW_TYPES: readonly FurnitureType[] = ["cabinet", "drawer", "shelf", "wall"];
export const BOX_ROWS_RANGE = { min: 1, max: 8 } as const;

/** 가구는 정면을 이만큼씩 시계 방향으로 돌린다 (도). */
export const BOX_ROTATION_STEP = 90;

/** 한 바퀴 (도). 회전은 0 이상 이 값 미만으로 둔다. */
export const FULL_TURN = 360;

/** 가구가 벽·다른 가구에 이만큼(cm)까지 파고든 것은 맞닿은 것으로 본다 (소수 오차). 면끼리 붙이는 것은 된다. */
export const TOUCH_TOLERANCE_CM = 0.01;

/** 가구 이름 최대 글자 수. "작은방 양문 수납장 2"(12자)가 넉넉히 들어가게 둔다. */
export const BOX_NAME_MAX_LENGTH = 15;

/** 침대 머리판 두께 (cm). 2D 평면도의 머리판 띠와 3D 머리판이 같은 두께다. */
export const BED_HEADBOARD_CM = 10;

/** 가구 종류마다 정한 기본 높이(cm)·칸 수·설치 높이(cm). */
export type FurnitureDefaults = { h: number; rows: number; cols: number; elevation: number };

/**
 * 가구 종류별 기본값 (기획서 3.4). 종류를 바꾸면 칸 수·설치 높이가 이 값이 되고,
 * 높이는 크기를 그대로 두다가 기본 높이를 고를 때만 바뀐다.
 */
export const FURNITURE_DEFAULTS: Record<FurnitureType, FurnitureDefaults> = {
  cabinet: { h: 180, rows: 4, cols: 2, elevation: 0 }, // 왼쪽·오른쪽 문 × 위에서 n번째 칸
  drawer: { h: 90, rows: 3, cols: 1, elevation: 0 },
  shelf: { h: 180, rows: 4, cols: 1, elevation: 0 },
  wall: { h: 60, rows: 2, cols: 1, elevation: 150 }, // 벽에 걸어 바닥에서 띄운다
  desk: { h: 73, rows: 1, cols: 1, elevation: 0 }, // 상판 위
  table: { h: 72, rows: 1, cols: 1, elevation: 0 }, // 테이블 위
  bed: { h: 45, rows: 2, cols: 1, elevation: 0 }, // 침대 위 · 침대 밑
  box: { h: 40, rows: 1, cols: 1, elevation: 0 }, // 보관함 안
};

/** 가구 종류의 화면 이름 (용어집). 새 가구 자동 이름("보관함 1")의 앞머리로도 쓴다. */
export const FURNITURE_LABELS: Record<FurnitureType, string> = {
  cabinet: "양문 수납장",
  drawer: "서랍장",
  shelf: "선반",
  wall: "벽걸이",
  desk: "책상",
  table: "테이블",
  bed: "침대",
  box: "보관함",
};
