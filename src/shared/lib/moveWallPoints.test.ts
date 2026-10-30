import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { moveWallPoints } from "./moveWallPoints";

const wall = (id: string, points: [number, number][], closed = false): Wall => ({
  id,
  tool: closed ? "rect" : "line",
  points: points.map(([x, y]) => ({ x, y })),
  closed,
});

describe("moveWallPoints", () => {
  it("그 자리 점을 옮기고, 끝점끼리 붙은 다른 벽의 점도 같이 옮긴다", () => {
    const walls = [
      wall("a", [
        [100, 100],
        [300, 100],
      ]),
      wall("b", [
        [300, 100],
        [300, 300],
      ]),
    ];
    const moved = moveWallPoints(walls, { x: 300, y: 100 }, { x: 350, y: 150 });
    expect(moved.map((item) => item.points)).toEqual([
      [
        { x: 100, y: 100 },
        { x: 350, y: 150 },
      ],
      [
        { x: 350, y: 150 },
        { x: 300, y: 300 },
      ],
    ]);
  });

  it("엣지: 그 점이 없는 벽은 원본 그대로 두고, 닫힌 벽은 닫힌 채로 꼭짓점만 옮긴다", () => {
    const line = wall("a", [
      [0, 0],
      [100, 0],
    ]);
    const rect = wall(
      "b",
      [
        [100, 100],
        [300, 100],
        [300, 250],
        [100, 250],
      ],
      true,
    );
    const moved = moveWallPoints([line, rect], { x: 300, y: 250 }, { x: 400, y: 300 });
    expect(moved[0]).toBe(line);
    expect(moved[1]).toEqual({
      ...rect,
      points: [rect.points[0], rect.points[1], { x: 400, y: 300 }, rect.points[3]],
    });
  });

  it("엣지: 맞는 점이 없으면 모두 원본 그대로다", () => {
    const walls = [
      wall("a", [
        [0, 0],
        [100, 0],
      ]),
    ];
    expect(moveWallPoints(walls, { x: 50, y: 0 }, { x: 60, y: 0 })[0]).toBe(walls[0]);
  });
});
