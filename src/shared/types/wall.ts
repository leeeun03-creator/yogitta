import type { Point } from "./point";

/** 벽을 만든 그리기 도구. 원·곡선도 저장할 때는 점 목록으로 바꾼다. */
export const WALL_TOOLS = ["line", "polyline", "rect", "circle", "curve"] as const;
export type WallTool = (typeof WALL_TOOLS)[number];

/** 그리기 도구로 만든 선의 묶음. 이웃한 두 점이 선분 하나 = 3D 벽 박스 하나가 된다. */
export type Wall = {
  id: string;
  tool: WallTool;
  points: Point[];
  closed: boolean; // 마지막 점과 첫 점을 잇는지 (사각형 등)
};
