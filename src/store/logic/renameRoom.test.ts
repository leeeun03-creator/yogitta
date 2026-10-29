import { describe, expect, it } from "vitest";
import { renameRoom } from "./renameRoom";
import { createRoomTestData, createTestBox } from "./roomFixtures";

describe("renameRoom", () => {
  it("자리를 지키며 이름을 바꾸고, 그 구역 가구도 따라 바뀐다", () => {
    const data = createRoomTestData(
      ["안방", "거실"],
      [createTestBox("1", "안방"), createTestBox("2", "거실"), createTestBox("3")],
    );
    const result = renameRoom(data, "안방", "큰방");
    if (!result.ok) throw new Error("바뀌어야 한다");
    const space = result.data.spaces[0];
    expect(space?.rooms).toEqual(["큰방", "거실"]);
    expect(space?.boxes.map((box) => box.room)).toEqual(["큰방", "거실", undefined]);
  });

  it("엣지: 다른 구역과 같은 이름·빈 이름은 막는다", () => {
    const data = createRoomTestData(["안방", "거실"]);
    expect(renameRoom(data, "안방", "거 실")).toEqual({ ok: false, reason: "duplicateName" });
    expect(renameRoom(data, "안방", "")).toEqual({ ok: false, reason: "emptyName" });
  });

  it("엣지: 같은 이름 그대로면 데이터가 그대로다 (되돌리기 기록이 늘지 않게)", () => {
    const data = createRoomTestData(["안방"]);
    expect(renameRoom(data, "안방", " 안방 ")).toEqual({ ok: true, data });
  });

  it("엣지: 띄어쓰기만 바꾸는 것은 된다", () => {
    const result = renameRoom(createRoomTestData(["작은방"]), "작은방", "작은 방");
    expect(result.ok && result.data.spaces[0]?.rooms).toEqual(["작은 방"]);
  });

  it("엣지: 없는 구역이면 그대로 둔다", () => {
    const data = createRoomTestData(["안방"]);
    expect(renameRoom(data, "부엌", "주방")).toEqual({ ok: true, data });
  });

  it("엣지: 원본을 바꾸지 않는다", () => {
    const data = createRoomTestData(["안방"], [createTestBox("1", "안방")]);
    Object.freeze(data.spaces[0]?.boxes[0]);
    renameRoom(data, "안방", "큰방");
    expect(data.spaces[0]?.rooms).toEqual(["안방"]);
    expect(data.spaces[0]?.boxes[0]?.room).toBe("안방");
  });
});
