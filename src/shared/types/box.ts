import type { FurnitureType } from "./furniture";
import type { Item } from "./item";

/**
 * 공간에 배치한 가구 하나. 위치·크기는 모두 cm, 바닥 위 중심 기준이다.
 * 구역은 저장하지 않고 놓인 구획에서 계산한다 (features/spaces의 boxRooms).
 */
export type Box = {
  id: string;
  name: string; // 공간 안에서 중복 불가
  type: FurnitureType;
  x: number; // 3D x = 2D x
  z: number; // 3D z = 2D y
  rotation: number; // 정면 방향 (도)
  w: number; // 가로
  d: number; // 깊이
  h: number; // 높이
  elevation: number; // 설치 높이. 벽걸이·가구 위 가구용
  parentId?: string; // 가구 위 가구면 받침 가구 id
  rows: number; // 세로 칸 수
  cols: number; // 가로 칸 수
  rowHeights?: number[]; // 칸 높이, 없으면 h를 rows로 균등 분배
  items: Item[];
};
