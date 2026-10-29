import { describe, expect, it } from "vitest";
import { removeRoom } from "./removeRoom";
import { createRoomTestData, createTestBox } from "./roomFixtures";

describe("removeRoom", () => {
  it("구역을 지우고, 그 구역 가구는 구역 없음이 된다", () => {
    const data = createRoomTestData(
      ["안방", "거실"],
      [createTestBox("1", "안방"), createTestBox("2", "거실")],
    );
    const space = removeRoom(data, "안방").spaces[0];
    expect(space?.rooms).toEqual(["거실"]);
    expect(space?.boxes[0]).not.toHaveProperty("room");
    expect(space?.boxes[1]?.room).toBe("거실");
  });

  it("다른 공간의 같은 이름 구역은 그대로다", () => {
    const data = removeRoom(createRoomTestData(["안방"]), "안방");
    expect(data.spaces[1]?.rooms).toEqual(["안방"]);
  });

  it("엣지: 없는 구역이면 그대로 둔다 (되돌리기 기록이 늘지 않게)", () => {
    const data = createRoomTestData(["안방"]);
    expect(removeRoom(data, "부엌")).toBe(data);
  });

  it("엣지: 마지막 구역을 지우면 구역 0개다", () => {
    expect(removeRoom(createRoomTestData(["안방"]), "안방").spaces[0]?.rooms).toEqual([]);
  });

  it("엣지: 원본을 바꾸지 않는다", () => {
    const data = createRoomTestData(["안방"], [createTestBox("1", "안방")]);
    Object.freeze(data.spaces[0]?.boxes[0]);
    removeRoom(data, "안방");
    expect(data.spaces[0]?.boxes[0]?.room).toBe("안방");
  });
});
