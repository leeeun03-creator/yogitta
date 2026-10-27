import type { Floor } from "@/shared/types";

/** 바닥 한 변의 입력 범위 (cm). 너무 작으면 가구를 못 놓고, 너무 크면 2D 평면도가 흐려진다. */
export const FLOOR_MIN_CM = 100;
export const FLOOR_MAX_CM = 3000;

/** 첫 실행 화면의 바닥 크기 입력 기본값 (원룸). */
export const DEFAULT_FLOOR: Floor = { w: 600, h: 450 };

/** 바닥 크기 빠른 선택 (시안 03). */
export const FLOOR_PRESETS: readonly { label: string; floor: Floor }[] = [
  { label: "원룸", floor: { w: 600, h: 450 } },
  { label: "투룸", floor: { w: 900, h: 600 } },
  { label: "아파트", floor: { w: 1200, h: 900 } },
];
