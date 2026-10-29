import type { Point } from "./point";

/** 구역을 나누려고 2D 평면도에 손 가는 대로 그은 선. 3D에는 서지 않는다. */
export type RoomLine = {
  id: string;
  points: Point[]; // 끝이 열린 선 (cm)
};
