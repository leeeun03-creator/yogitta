import type { Box } from "./box";
import type { Point } from "./point";
import type { RoomLine } from "./roomLine";
import type { Wall } from "./wall";

/** 공간을 만들 때 정한 바닥 크기 (cm). 그대로 3D 바닥이 된다. */
export type Floor = { w: number; h: number };

/** 벽·가구·물건 한 세트. "내 방", "형 방"처럼 사용자가 이름 붙인 단위다. */
export type Space = {
  id: string;
  name: string; // 중복 불가
  floor: Floor;
  rooms: string[]; // 공간 안 구역 이름 (선택)
  roomLines?: RoomLine[]; // 구역 선. 벽·바닥 테두리와 함께 바닥을 구획으로 나눈다
  roomAnchors?: Record<string, Point>; // 구역 이름 → 구역 기준점 (이 점이 든 구획이 그 구역)
  walls: Wall[];
  boxes: Box[];
};
