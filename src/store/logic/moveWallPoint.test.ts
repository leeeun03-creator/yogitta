import { describe, expect, it } from "vitest";
import type { AppData, Wall } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { moveWallPoint } from "./moveWallPoint";
import { deepFreeze } from "./spaceFixtures";

const LINE: Wall = {
  id: "wall_1",
  tool: "line",
  points: [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
  ],
  closed: false,
};

/** 가구 하나(가운데 450, 350 · 60 × 50)와 벽 하나가 있는 데이터. */
function withWall(walls: Wall[] = [LINE]): AppData {
  const base = createBoxTestData([{ x: 450, z: 350 }]);
  const [mine, other] = base.spaces;
  if (!mine || !other) throw new Error("테스트 공간이 없다");
  return { ...base, spaces: [{ ...mine, walls }, other] };
}
const pointsOf = (data: AppData) => data.spaces[0]?.walls.map((wall) => wall.points);

describe("moveWallPoint", () => {
  it("벽 점을 옮긴다", () => {
    const result = moveWallPoint(withWall(), { x: 300, y: 100 }, { x: 300, y: 250 });
    expect(result.ok && pointsOf(result.data)).toEqual([
      [
        { x: 100, y: 100 },
        { x: 300, y: 250 },
      ],
    ]);
  });

  it("엣지: 옆 점 위로 겹쳐 선분 길이가 0이 되면 옮기지 않는다", () => {
    expect(moveWallPoint(withWall(), { x: 300, y: 100 }, { x: 100, y: 100 })).toEqual({
      ok: false,
      reason: "zeroLength",
    });
  });

  it("엣지: 옮긴 벽이 가구를 지나가면 옮기지 않는다", () => {
    expect(moveWallPoint(withWall(), { x: 300, y: 100 }, { x: 500, y: 400 })).toEqual({
      ok: false,
      reason: "blocked",
    });
  });

  it("엣지: 같은 자리·없는 점이면 원본 그대로다 (되돌리기 기록이 안 남는다)", () => {
    const original = withWall();
    const same = moveWallPoint(original, { x: 300, y: 100 }, { x: 300, y: 100 });
    const missing = moveWallPoint(original, { x: 200, y: 100 }, { x: 250, y: 100 });
    expect(same.ok && same.data).toBe(original);
    expect(missing.ok && missing.data).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(withWall());
    const result = moveWallPoint(original, { x: 100, y: 100 }, { x: 100, y: 50 });
    expect(result.ok && pointsOf(result.data)?.[0]?.[0]).toEqual({ x: 100, y: 50 });
  });
});
