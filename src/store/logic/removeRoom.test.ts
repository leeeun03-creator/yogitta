import { describe, expect, it } from "vitest";
import { removeRoom } from "./removeRoom";
import { createRoomTestData } from "./roomFixtures";
import { deepFreeze } from "./spaceFixtures";

describe("removeRoom", () => {
  it("구역을 지우고, 가구는 건드리지 않는다 (가구 구역은 놓인 자리에서 계산한다)", () => {
    const data = createRoomTestData(["안방", "거실"]);
    const space = removeRoom(data, "안방").spaces[0];
    expect(space?.rooms).toEqual(["거실"]);
    expect(space?.boxes).toBe(data.spaces[0]?.boxes);
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
    const data = deepFreeze(createRoomTestData(["안방"]));
    removeRoom(data, "안방");
    expect(data.spaces[0]?.rooms).toEqual(["안방"]);
  });
});
