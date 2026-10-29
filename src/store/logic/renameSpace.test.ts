import { describe, expect, it } from "vitest";
import { renameSpace } from "./renameSpace";
import { createSpacesData, deepFreeze } from "./spaceFixtures";

const names = (result: ReturnType<typeof renameSpace>) =>
  result.ok ? result.data.spaces.map((space) => space.name) : result.reason;

describe("renameSpace", () => {
  it("공간 이름을 바꾸고 앞뒤 공백은 지운다", () => {
    const data = createSpacesData(["내 방", "형 방"]);
    expect(names(renameSpace(data, "space_2", "  동생 방 "))).toEqual(["내 방", "동생 방"]);
  });

  it("지금 공간이 아닌 공간도 바꿀 수 있고, 지금 공간은 그대로다", () => {
    const result = renameSpace(createSpacesData(["내 방", "형 방"]), "space_2", "서재");
    expect(result.ok && result.data.currentSpaceId).toBe("space_1");
  });

  it("엣지: 빈 이름·공백만은 막는다", () => {
    const data = createSpacesData(["내 방"]);
    expect(renameSpace(data, "space_1", "")).toEqual({ ok: false, reason: "emptyName" });
    expect(renameSpace(data, "space_1", "   ")).toEqual({ ok: false, reason: "emptyName" });
  });

  it("엣지: 다른 공간과 같은 이름(앞뒤 공백만 다른 것도)은 막는다", () => {
    const data = createSpacesData(["내 방", "형 방"]);
    expect(renameSpace(data, "space_2", " 내 방 ")).toEqual({
      ok: false,
      reason: "duplicateName",
    });
  });

  it("엣지: 자기 이름 그대로면 괜찮고 데이터도 그대로다", () => {
    const data = createSpacesData(["내 방", "형 방"]);
    expect(renameSpace(data, "space_1", "내 방")).toEqual({ ok: true, data });
    expect(renameSpace(data, "space_1", " 내 방 ")).toEqual({ ok: true, data });
  });

  it("엣지: 없는 공간이면 데이터가 그대로다", () => {
    const data = createSpacesData(["내 방"]);
    expect(renameSpace(data, "space_9", "서재")).toEqual({ ok: true, data });
  });

  it("엣지: 원본을 바꾸지 않는다", () => {
    const data = deepFreeze(createSpacesData(["내 방", "형 방"]));
    expect(() => renameSpace(data, "space_1", "서재")).not.toThrow();
    expect(data.spaces[0]?.name).toBe("내 방");
  });
});
