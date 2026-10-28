import { describe, expect, it } from "vitest";
import { updateCurrentSpace } from "./updateCurrentSpace";
import { createWallTestData } from "./wallFixtures";

describe("updateCurrentSpace", () => {
  it("현재 공간만 바꾸고 다른 공간은 같은 객체로 둔다", () => {
    const original = createWallTestData();
    const data = updateCurrentSpace(original, (space) => ({ ...space, name: "바뀐 방" }));
    expect(data.spaces[0]?.name).toBe("바뀐 방");
    expect(data.spaces[1]).toBe(original.spaces[1]);
    expect(original.spaces[0]?.name).toBe("내 방");
  });

  it("바꿀 것이 없으면(같은 공간을 돌려주면) 원본을 그대로 돌려준다", () => {
    const original = createWallTestData();
    expect(updateCurrentSpace(original, (space) => space)).toBe(original);
  });

  it("현재 공간이 없거나 못 찾으면 원본을 그대로 돌려준다", () => {
    const noCurrent = { ...createWallTestData(), currentSpaceId: null };
    const missing = { ...createWallTestData(), currentSpaceId: "space_x" };
    expect(updateCurrentSpace(noCurrent, (space) => ({ ...space, name: "x" }))).toBe(noCurrent);
    expect(updateCurrentSpace(missing, (space) => ({ ...space, name: "x" }))).toBe(missing);
  });
});
