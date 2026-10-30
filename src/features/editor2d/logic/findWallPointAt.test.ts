import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { findWallPointAt } from "./findWallPointAt";

const WALLS: Wall[] = [
  {
    id: "wall_1",
    tool: "polyline",
    points: [
      { x: 100, y: 100 },
      { x: 110, y: 100 },
      { x: 300, y: 100 },
    ],
    closed: false,
  },
];

describe("findWallPointAt", () => {
  it("반경 안에서 가장 가까운 벽 점을 찾는다", () => {
    expect(findWallPointAt(WALLS, { x: 107, y: 101 }, 8)).toEqual({ x: 110, y: 100 });
    expect(findWallPointAt(WALLS, { x: 296, y: 104 }, 8)).toEqual({ x: 300, y: 100 });
  });

  it("엣지: 반경 밖이거나 벽이 없으면 null (반경 끝은 들어간다)", () => {
    expect(findWallPointAt(WALLS, { x: 200, y: 100 }, 8)).toBeNull();
    expect(findWallPointAt(WALLS, { x: 308, y: 100 }, 8)).toEqual({ x: 300, y: 100 });
    expect(findWallPointAt([], { x: 100, y: 100 }, 8)).toBeNull();
  });
});
