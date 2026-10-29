import { describe, expect, it } from "vitest";
import { createSpacesData, deepFreeze } from "./spaceFixtures";
import { switchSpace } from "./switchSpace";

describe("switchSpace", () => {
  it("지금 공간을 고른 공간으로 바꾸고, 공간들은 그대로 둔다", () => {
    const data = createSpacesData(["내 방", "형 방"]);
    const next = switchSpace(data, "space_2");
    expect(next.currentSpaceId).toBe("space_2");
    expect(next.spaces).toBe(data.spaces);
  });

  it("엣지: 없는 공간이면 그대로다", () => {
    const data = createSpacesData(["내 방", "형 방"]);
    expect(switchSpace(data, "space_9")).toBe(data);
  });

  it("엣지: 이미 지금 공간이면 그대로다", () => {
    const data = createSpacesData(["내 방", "형 방"], 1);
    expect(switchSpace(data, "space_2")).toBe(data);
  });

  it("엣지: 원본을 바꾸지 않는다", () => {
    const data = deepFreeze(createSpacesData(["내 방", "형 방"]));
    expect(() => switchSpace(data, "space_2")).not.toThrow();
    expect(data.currentSpaceId).toBe("space_1");
  });
});
