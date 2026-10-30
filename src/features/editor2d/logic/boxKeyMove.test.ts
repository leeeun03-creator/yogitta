import { describe, expect, it } from "vitest";
import type { Box, Space } from "@/shared/types";
import { boxKeyMove } from "./boxKeyMove";

const box = (id: string, x: number, z: number): Box => ({
  id,
  name: id,
  type: "box",
  x,
  z,
  rotation: 0,
  w: 100,
  d: 100,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
});
const space = (boxes: Box[], walls: Space["walls"] = []): Space => ({
  id: "space_1",
  name: "내 방",
  floor: { w: 600, h: 450 },
  rooms: [],
  walls,
  boxes,
});
const WALL = {
  id: "wall_1",
  tool: "line" as const,
  points: [
    { x: 300, y: 0 },
    { x: 300, y: 450 },
  ],
  closed: false,
}; // 벽 면: x 294

describe("boxKeyMove", () => {
  it("막는 것이 없으면 한 칸(10cm) 옮긴다", () => {
    const target = box("a", 150, 150);
    expect(boxKeyMove(target, { x: 1, y: 0 }, 10, space([target]))).toEqual({ x: 160, y: 150 });
  });

  it("엣지: 벽이 한 칸보다 가까우면 벽 면에 딱 붙는 데까지만, 붙어 있으면 그대로다", () => {
    const near = box("a", 240, 150); // 오른쪽 면 290, 벽까지 4cm
    expect(boxKeyMove(near, { x: 1, y: 0 }, 10, space([near], [WALL]))).toEqual({ x: 244, y: 150 });
    const touching = box("a", 244, 150);
    expect(boxKeyMove(touching, { x: 1, y: 0 }, 10, space([touching], [WALL]))).toEqual({
      x: 244,
      y: 150,
    });
  });

  it("엣지: 다른 가구에도 붙는 데까지만, 반대쪽으로는 그대로 간다", () => {
    const target = box("a", 150, 150);
    const other = box("b", 255, 150); // 왼쪽 면 205, 5cm 떨어짐
    const room = space([target, other]);
    expect(boxKeyMove(target, { x: 1, y: 0 }, 10, room)).toEqual({ x: 155, y: 150 });
    expect(boxKeyMove(target, { x: -1, y: 0 }, 10, room)).toEqual({ x: 140, y: 150 });
  });

  it("엣지: 바닥 경계 밖으로는 나가지 않는다", () => {
    const corner = box("a", 55, 50);
    expect(boxKeyMove(corner, { x: -1, y: -1 }, 10, space([corner]))).toEqual({ x: 50, y: 50 });
  });
});
