import { describe, expect, it } from "vitest";
import type { Point, Wall } from "@/shared/types";
import { snapToWall } from "./snapToWall";

const wall = (a: Point, b: Point): Wall => ({
  id: "w",
  tool: "line",
  points: [a, b],
  closed: false,
});
const SHELF = { d: 40 }; // 깊이 40 → 벽 가운데선에서 가구 가운데까지 6 + 20 = 26
const HORIZONTAL = wall({ x: 0, y: 100 }, { x: 600, y: 100 });
const VERTICAL = wall({ x: 300, y: 0 }, { x: 300, y: 450 });

describe("snapToWall", () => {
  it("가로 벽 아래·위에 붙이면 정면이 벽 반대쪽(아래 0도, 위 180도)을 본다", () => {
    expect(snapToWall(SHELF, { x: 200, y: 140 }, [HORIZONTAL])).toEqual({
      center: { x: 200, y: 126 },
      rotation: 0,
    });
    expect(snapToWall(SHELF, { x: 200, y: 60 }, [HORIZONTAL])).toEqual({
      center: { x: 200, y: 74 },
      rotation: 180,
    });
  });

  it("세로 벽 오른쪽·왼쪽에 붙이면 270도·90도다", () => {
    expect(snapToWall(SHELF, { x: 340, y: 200 }, [VERTICAL])?.rotation).toBe(270);
    expect(snapToWall(SHELF, { x: 260, y: 200 }, [VERTICAL])).toEqual({
      center: { x: 274, y: 200 },
      rotation: 90,
    });
  });

  it("엣지: 뒷면에서 벽 면까지 30cm를 넘으면 붙이지 않는다 (가운데까지 26 + 30 = 56)", () => {
    expect(snapToWall(SHELF, { x: 244, y: 200 }, [VERTICAL])).not.toBeNull();
    expect(snapToWall(SHELF, { x: 243, y: 200 }, [VERTICAL])).toBeNull();
  });

  it("엣지: 비스듬한 벽, 선분 끝 너머, 벽이 없으면 붙이지 않는다", () => {
    const diagonal = wall({ x: 0, y: 0 }, { x: 300, y: 300 });
    expect(snapToWall(SHELF, { x: 150, y: 170 }, [diagonal])).toBeNull();
    expect(snapToWall(SHELF, { x: 260, y: 470 }, [VERTICAL])).toBeNull();
    expect(snapToWall(SHELF, { x: 260, y: 200 }, [])).toBeNull();
  });

  it("엣지: 벽이 둘이면 가까운 벽에 붙는다 (닫힌 사각형 벽도 선분마다 본다)", () => {
    const room = {
      ...wall({ x: 100, y: 100 }, { x: 500, y: 100 }),
      closed: true,
      points: [
        { x: 100, y: 100 },
        { x: 500, y: 100 },
        { x: 500, y: 400 },
        { x: 100, y: 400 },
      ],
    };
    expect(snapToWall(SHELF, { x: 480, y: 130 }, [room])?.rotation).toBe(90); // 오른쪽 벽이 더 가깝다
  });
});
