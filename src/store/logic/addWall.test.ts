import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { addWall } from "./addWall";
import { createBoxTestData } from "./boxFixtures";
import { createWallTestData } from "./wallFixtures";

const LINE: Wall = {
  id: "wall_1",
  tool: "line",
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  closed: false,
};

describe("addWall", () => {
  it("현재 공간에만 벽을 더한다", () => {
    const data = addWall(createWallTestData(), LINE);
    expect(data.spaces[0]?.walls).toEqual([LINE]);
    expect(data.spaces[1]?.walls).toEqual([]);
  });

  it("점이 2개보다 적은 벽은 더하지 않는다", () => {
    const original = createWallTestData();
    expect(addWall(original, { ...LINE, points: [{ x: 0, y: 0 }] })).toBe(original);
  });

  it("현재 공간이 없으면 그대로 둔다", () => {
    const original = { ...createWallTestData(), currentSpaceId: null };
    expect(addWall(original, LINE)).toBe(original);
  });

  it("가구에 파고드는 벽은 더하지 않고, 가구 면에 맞닿는 벽은 더한다", () => {
    const original = createBoxTestData([{ x: 50, z: 100, w: 100, d: 100 }]); // y 50 ~ 150
    const through = {
      ...LINE,
      points: [
        { x: 0, y: 100 },
        { x: 200, y: 100 },
      ],
    };
    expect(addWall(original, through)).toBe(original);
    const touching = {
      ...LINE,
      points: [
        { x: 0, y: 44 },
        { x: 200, y: 44 },
      ],
    }; // 벽 면 y 50
    expect(addWall(original, touching).spaces[0]?.walls).toEqual([touching]);
  });

  it("엣지: 다른 공간의 가구는 보지 않는다", () => {
    const base = createBoxTestData([{ x: 50, z: 100, w: 100, d: 100 }]);
    const [mine, other] = base.spaces;
    if (!mine || !other) throw new Error("테스트 공간이 없다");
    const swapped = {
      ...base,
      spaces: [
        { ...mine, boxes: [] },
        { ...other, boxes: mine.boxes },
      ],
    };
    const through = {
      ...LINE,
      points: [
        { x: 0, y: 100 },
        { x: 200, y: 100 },
      ],
    };
    expect(addWall(swapped, through).spaces[0]?.walls).toEqual([through]);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = createWallTestData();
    addWall(original, LINE);
    expect(original.spaces[0]?.walls).toEqual([]);
  });
});
