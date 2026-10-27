/** 가구 종류 8가지. 정해진 목록에서만 고른다. 가구를 처음 놓으면 보관함(box)이다. */
export const FURNITURE_TYPES = [
  "cabinet", // 양문 수납장
  "drawer", // 서랍장
  "shelf", // 선반
  "wall", // 벽걸이
  "desk", // 책상
  "table", // 테이블
  "bed", // 침대
  "box", // 보관함
] as const;
export type FurnitureType = (typeof FURNITURE_TYPES)[number];
