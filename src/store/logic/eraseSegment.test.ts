import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { eraseSegment } from "./eraseSegment";
import { createWallTestData } from "./wallFixtures";

const P = (x: number, y: number) => ({ x, y });
const FIRST: Wall = { id: "wall_a", tool: "line", points: [P(0, 0), P(50, 0)], closed: false };
const OPEN: Wall = {
  id: "wall_b",
  tool: "polyline",
  points: [P(0, 0), P(100, 0), P(100, 100), P(0, 100)],
  closed: false,
};
const LAST: Wall = { id: "wall_c", tool: "line", points: [P(0, 200), P(50, 200)], closed: false };

describe("eraseSegment", () => {
  it("가운데 선분을 지우면 그 자리에 두 조각이 순서대로 들어간다", () => {
    const data = eraseSegment(
      createWallTestData([FIRST, OPEN, LAST]),
      { wallId: "wall_b", segment: 1 },
      "wall_new",
    );
    expect(data.spaces[0]?.walls.map((wall) => wall.id)).toEqual([
      "wall_a",
      "wall_b",
      "wall_new",
      "wall_c",
    ]);
  });

  it("선분 1개짜리 벽을 지우면 목록에서 빠진다", () => {
    const data = eraseSegment(
      createWallTestData([FIRST, LAST]),
      { wallId: "wall_a", segment: 0 },
      "wall_new",
    );
    expect(data.spaces[0]?.walls).toEqual([LAST]);
  });

  it("엣지: 없는 벽 id나 범위 밖 선분이면 원본을 그대로 돌려준다", () => {
    const original = createWallTestData([OPEN]);
    expect(eraseSegment(original, { wallId: "wall_x", segment: 0 }, "wall_new")).toBe(original);
    expect(eraseSegment(original, { wallId: "wall_b", segment: 9 }, "wall_new")).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = createWallTestData([OPEN]);
    eraseSegment(original, { wallId: "wall_b", segment: 1 }, "wall_new");
    expect(original.spaces[0]?.walls).toEqual([OPEN]);
  });
});
