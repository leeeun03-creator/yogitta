import type { FurnitureType } from "@/shared/types";

/** 가구를 누르기만 해서 놓을 때의 크기와 새 가구의 높이 (cm). PRD 인수 조건 "가구 변신"의 보관함과 같다. */
export const BOX_DEFAULT_SIZE = { w: 60, d: 50, h: 90 } as const;

/** 가구 가로·깊이의 최소값 (cm). 스냅 격자 한 칸이다. */
export const BOX_MIN_SIZE_CM = 10;

/** 가구는 정면을 이만큼씩 시계 방향으로 돌린다 (도). */
export const BOX_ROTATION_STEP = 90;

/** 한 바퀴 (도). 회전은 0 이상 이 값 미만으로 둔다. */
export const FULL_TURN = 360;

/** 가구가 벽·다른 가구에 이만큼(cm)까지 파고든 것은 맞닿은 것으로 본다 (소수 오차). 면끼리 붙이는 것은 된다. */
export const TOUCH_TOLERANCE_CM = 0.01;

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
