import { describe, expect, it } from "vitest";
import { removeSpace } from "./removeSpace";
import { createSpacesData, deepFreeze } from "./spaceFixtures";

const THREE = ["내 방", "형 방", "거실"];
const ids = (data: ReturnType<typeof removeSpace>) => data.spaces.map((space) => space.id);

describe("removeSpace", () => {
  it("지금 공간이 아닌 공간을 지우면 지금 공간은 그대로다", () => {
    const data = removeSpace(createSpacesData(THREE, 0), "space_2");
    expect(ids(data)).toEqual(["space_1", "space_3"]);
    expect(data.currentSpaceId).toBe("space_1");
  });

  it("지금 공간을 지우면 그 자리의 다음 공간이 지금 공간이 된다 (가운데)", () => {
    const data = removeSpace(createSpacesData(THREE, 1), "space_2");
    expect(data.currentSpaceId).toBe("space_3");
  });

  it("엣지: 첫 공간을 지우면 다음 공간으로", () => {
    expect(removeSpace(createSpacesData(THREE, 0), "space_1").currentSpaceId).toBe("space_2");
  });

  it("엣지: 마지막 공간을 지우면 앞 공간으로", () => {
    expect(removeSpace(createSpacesData(THREE, 2), "space_3").currentSpaceId).toBe("space_2");
  });

  it("엣지: 하나뿐인 공간을 지우면 공간이 없고 지금 공간은 null (첫 실행 화면)", () => {
    const data = removeSpace(createSpacesData(["내 방"]), "space_1");
    expect(data.spaces).toEqual([]);
    expect(data.currentSpaceId).toBeNull();
  });

  it("엣지: 없는 공간이면 그대로다", () => {
    const data = createSpacesData(THREE);
    expect(removeSpace(data, "space_9")).toBe(data);
  });

  it("엣지: 원본을 바꾸지 않는다", () => {
    const data = deepFreeze(createSpacesData(THREE));
    expect(() => removeSpace(data, "space_1")).not.toThrow();
    expect(data.spaces).toHaveLength(3);
  });
});
