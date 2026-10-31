import { describe, expect, it } from "vitest";
import { createBoxTestData } from "./boxFixtures";
import { changeElevation } from "./changeElevation";
import { deepFreeze } from "./spaceFixtures";

// 벽걸이 60 × 50 × 60, 설치 높이 150 (가운데 (300, 200))
const shelf = { type: "wall" as const, h: 60, elevation: 150 };
const elevationOf = (result: ReturnType<typeof changeElevation>) =>
  result.ok ? result.data.spaces[0]?.boxes[0]?.elevation : result.reason;

describe("changeElevation", () => {
  it("벽걸이 설치 높이를 바꾼다 (바닥 0부터, 설치 높이 + 높이 240까지)", () => {
    expect(elevationOf(changeElevation(createBoxTestData([shelf]), "box_1", 120))).toBe(120);
    expect(elevationOf(changeElevation(createBoxTestData([shelf]), "box_1", 0))).toBe(0);
    expect(elevationOf(changeElevation(createBoxTestData([shelf]), "box_1", 180))).toBe(180);
  });

  it("엣지: 바닥보다 낮거나 240cm를 넘으면 막는다", () => {
    expect(elevationOf(changeElevation(createBoxTestData([shelf]), "box_1", -1))).toBe("tooLow");
    expect(elevationOf(changeElevation(createBoxTestData([shelf]), "box_1", 181))).toBe("tooHigh");
  });

  it("엣지: 그 높이에서 아래 가구와 겹치면 막고, 맞닿기만 하면 된다 (아래 보관함 높이 90)", () => {
    const data = createBoxTestData([shelf, { h: 90 }]);
    expect(elevationOf(changeElevation(data, "box_1", 60))).toBe("blocked");
    expect(elevationOf(changeElevation(data, "box_1", 90))).toBe(90);
  });

  it("엣지: 벽걸이가 아니거나 없는 가구, 같은 높이면 원본 그대로다", () => {
    const original = deepFreeze(createBoxTestData([shelf, {}]));
    for (const [id, elevation] of [
      ["box_1", 150],
      ["box_2", 100],
      ["box_9", 100],
    ] as const) {
      const result = changeElevation(original, id, elevation);
      expect(result.ok && result.data).toBe(original);
    }
  });
});
