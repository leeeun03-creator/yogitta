import { describe, expect, it } from "vitest";
import type { Box, Wall } from "@/shared/types";
import { isPlacementBlocked } from "./isPlacementBlocked";
import { overlappingBoxes } from "./overlappingBoxes";

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
const WALL: Wall = {
  id: "wall_1",
  tool: "line",
  points: [
    { x: 300, y: 0 },
    { x: 300, y: 450 },
  ],
  closed: false,
}; // 벽 면: x 294 · 306
const FLOOR = { w: 600, h: 450 };

describe("overlappingBoxes", () => {
  it("벽이 지나가는 가구만 들어간다", () => {
    const result = overlappingBoxes({
      walls: [WALL],
      boxes: [box("a", 300, 100), box("b", 100, 300)],
    });
    expect([...result]).toEqual(["a"]);
  });

  it("엣지: 서로 겹친 가구는 둘 다 들어가고, 맞닿기만 한 가구는 빠진다", () => {
    const boxes = [box("a", 100, 100), box("b", 150, 120), box("c", 400, 100), box("d", 500, 100)];
    expect([...overlappingBoxes({ walls: [], boxes })]).toEqual(["a", "b"]);
  });

  it("엣지: 가구·벽이 없으면 비어 있다", () => {
    expect(overlappingBoxes({ walls: [WALL], boxes: [] }).size).toBe(0);
  });
});

describe("isPlacementBlocked", () => {
  it("벽·다른 가구에 파고드는 자리는 막히고, 맞닿는 자리는 된다", () => {
    const space = { floor: FLOOR, walls: [WALL], boxes: [box("a", 100, 100)] };
    expect(isPlacementBlocked({ center: { x: 280, y: 300 }, w: 60, d: 60 }, space)).toBe(true);
    expect(isPlacementBlocked({ center: { x: 264, y: 300 }, w: 60, d: 60 }, space)).toBe(false);
    expect(isPlacementBlocked({ center: { x: 160, y: 100 }, w: 60, d: 60 }, space)).toBe(true);
    expect(isPlacementBlocked({ center: { x: 180, y: 100 }, w: 60, d: 60 }, space)).toBe(false);
  });

  it("엣지: 바닥 안으로 맞춘 자리로 본다 (바닥 밖에 놓아도 당겨진 자리에서 겹치면 막힌다)", () => {
    const space = { floor: FLOOR, walls: [], boxes: [box("a", 50, 50)] };
    expect(isPlacementBlocked({ center: { x: -100, y: -100 }, w: 60, d: 60 }, space)).toBe(true);
  });
});
