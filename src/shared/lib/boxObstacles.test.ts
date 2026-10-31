import { describe, expect, it } from "vitest";
import type { Box, Wall } from "@/shared/types";
import { boxObstacles } from "./boxObstacles";
import { isBoxBlocked } from "./isBoxBlocked";

const box = (id: string, x: number, z: number, rotation = 0): Box => ({
  id,
  name: id,
  type: "box",
  x,
  z,
  rotation,
  w: 100,
  d: 40,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
});
const WALL: Wall = {
  id: "wall_1",
  tool: "line",
  points: [
    { x: 300, y: 0 },
    { x: 300, y: 450 },
  ],
  closed: false,
};
const SIZE = { w: 60, d: 60 };

describe("boxObstacles · isBoxBlocked", () => {
  it("벽과 다른 가구가 막고, 자기 자신은 막지 않는다", () => {
    const obstacles = boxObstacles(
      { walls: [WALL], boxes: [box("a", 100, 100), box("b", 450, 300)] },
      "a",
    );
    expect(obstacles).toHaveLength(2); // 벽 선분 1 + 가구 b
    expect(isBoxBlocked({ x: 100, y: 100 }, SIZE, obstacles)).toBe(false); // 자기 자리
    expect(isBoxBlocked({ x: 300, y: 100 }, SIZE, obstacles)).toBe(true); // 벽
    expect(isBoxBlocked({ x: 450, y: 300 }, SIZE, obstacles)).toBe(true); // 가구 b
  });

  it("엣지: 맞닿은 것(벽 면 294에 오른쪽 면)은 막히지 않는다", () => {
    const obstacles = boxObstacles({ walls: [WALL], boxes: [] }, null);
    expect(isBoxBlocked({ x: 264, y: 100 }, SIZE, obstacles)).toBe(false);
    expect(isBoxBlocked({ x: 265, y: 100 }, SIZE, obstacles)).toBe(true);
  });

  it("엣지: 90도 돌린 가구는 돌린 모양(40 × 100)으로 막는다", () => {
    const obstacles = boxObstacles({ walls: [], boxes: [box("b", 450, 300, 90)] }, null);
    expect(isBoxBlocked({ x: 450, y: 230 }, SIZE, obstacles)).toBe(true); // 위로 50까지 막힘
    expect(isBoxBlocked({ x: 500, y: 300 }, SIZE, obstacles)).toBe(false); // 옆으로는 20까지만 (+30 = 맞닿음)
  });

  it("엣지: 새로 놓을 가구(null)면 모든 가구가 막고, 가구·벽이 없으면 아무것도 막지 않는다", () => {
    expect(boxObstacles({ walls: [], boxes: [box("a", 0, 0), box("b", 1, 1)] }, null)).toHaveLength(
      2,
    );
    expect(boxObstacles({ walls: [], boxes: [] }, null)).toEqual([]);
  });

  it("높이 범위를 주면 높이가 겹치는 가구만 막는다 (맞닿는 높이: 받침 가구 위·벽걸이 아래는 막지 않는다)", () => {
    const shelf: Box = { ...box("shelf", 450, 300), type: "wall", elevation: 150, h: 60 };
    const boxes = [box("desk", 100, 100), shelf];
    expect(boxObstacles({ walls: [], boxes }, null, { bottom: 0, top: 40 })).toHaveLength(1); // 책상만
    expect(boxObstacles({ walls: [], boxes }, null, { bottom: 90, top: 130 })).toHaveLength(0); // 책상 위
    expect(boxObstacles({ walls: [], boxes }, null, { bottom: 120, top: 160 })).toHaveLength(1); // 벽걸이
  });

  it("그 가구 위에 올린 가구(두 층 포함)는 같이 움직이니 막지 않는다", () => {
    const top: Box = { ...box("top", 100, 100), elevation: 90, parentId: "desk" };
    const topmost: Box = { ...box("topmost", 100, 100), elevation: 180, parentId: "top" };
    const boxes = [box("desk", 100, 100), top, topmost, box("other", 450, 300)];
    expect(boxObstacles({ walls: [], boxes }, "desk")).toHaveLength(1); // other만
  });
});
