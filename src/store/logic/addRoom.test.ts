import { describe, expect, it } from "vitest";
import { addRoom } from "./addRoom";
import { createRoomTestData } from "./roomFixtures";

describe("addRoom", () => {
  it("현재 공간 구역 목록 끝에 더한다", () => {
    const result = addRoom(createRoomTestData(["안방"]), " 거실 ");
    expect(result.ok && result.data.spaces[0]?.rooms).toEqual(["안방", "거실"]);
  });

  it("다른 공간에 같은 이름이 있어도 된다 (공간마다 따로)", () => {
    const result = addRoom(createRoomTestData(), "안방");
    expect(result.ok && result.data.spaces[0]?.rooms).toEqual(["안방"]);
    expect(result.ok && result.data.spaces[1]?.rooms).toEqual(["안방"]);
  });

  it("엣지: 빈 이름·같은 이름·10자 넘음은 이유와 함께 막는다", () => {
    const data = createRoomTestData(["안방"]);
    expect(addRoom(data, " ")).toEqual({ ok: false, reason: "emptyName" });
    expect(addRoom(data, "안 방")).toEqual({ ok: false, reason: "duplicateName" });
    expect(addRoom(data, "가".repeat(11))).toEqual({ ok: false, reason: "tooLong" });
  });

  it("엣지: 현재 공간이 없으면 그대로 둔다", () => {
    const data = { ...createRoomTestData(), currentSpaceId: null };
    expect(addRoom(data, "안방")).toEqual({ ok: true, data });
  });

  it("엣지: 원본을 바꾸지 않는다", () => {
    const data = createRoomTestData(["안방"]);
    Object.freeze(data.spaces[0]?.rooms);
    expect(() => addRoom(data, "거실")).not.toThrow();
    expect(data.spaces[0]?.rooms).toEqual(["안방"]);
  });
});
