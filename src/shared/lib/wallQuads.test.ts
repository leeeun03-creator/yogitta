import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { wallQuads } from "./wallQuads";

const wall = (points: [number, number][], closed = false): Wall => ({
  id: "wall_1",
  tool: closed ? "rect" : "line",
  points: points.map(([x, y]) => ({ x, y })),
  closed,
});

/** 꼭짓점들의 감싸는 범위 [왼쪽, 위, 오른쪽, 아래] (소수 오차 반올림). */
const bounds = (quad: { x: number; y: number }[]) => [
  Math.round(Math.min(...quad.map((p) => p.x))),
  Math.round(Math.min(...quad.map((p) => p.y))),
  Math.round(Math.max(...quad.map((p) => p.x))),
  Math.round(Math.max(...quad.map((p) => p.y))),
];

describe("wallQuads", () => {
  it("가로 선분은 위아래로 6cm씩 두께, 양 끝으로 6cm씩 각진 끝이다", () => {
    const [quad] = wallQuads([
      wall([
        [100, 200],
        [400, 200],
      ]),
    ]);
    expect(bounds(quad ?? [])).toEqual([94, 194, 406, 206]);
  });

  it("세로 선분도 같다", () => {
    const [quad] = wallQuads([
      wall([
        [300, 0],
        [300, 450],
      ]),
    ]);
    expect(bounds(quad ?? [])).toEqual([294, -6, 306, 456]);
  });

  it("엣지: 닫힌 벽은 마지막 점 → 첫 점 선분까지 4개다", () => {
    const quads = wallQuads([
      wall(
        [
          [0, 0],
          [100, 0],
          [100, 100],
          [0, 100],
        ],
        true,
      ),
    ]);
    expect(quads).toHaveLength(4);
  });

  it("엣지: 비스듬한 선분은 선분 방향으로 돌린 사각형이다 (두께 12cm)", () => {
    const [quad] = wallQuads([
      wall([
        [0, 0],
        [300, 400],
      ]),
    ]);
    const [p0, p1, , p3] = quad ?? [];
    expect(Math.hypot((p0?.x ?? 0) - (p3?.x ?? 0), (p0?.y ?? 0) - (p3?.y ?? 0))).toBeCloseTo(12);
    expect(Math.hypot((p0?.x ?? 0) - (p1?.x ?? 0), (p0?.y ?? 0) - (p1?.y ?? 0))).toBeCloseTo(512);
  });

  it("엣지: 길이 0인 선분과 점 하나뿐인 벽은 뺀다", () => {
    expect(
      wallQuads([
        wall([
          [50, 50],
          [50, 50],
        ]),
        wall([[10, 10]]),
      ]),
    ).toEqual([]);
  });
});
