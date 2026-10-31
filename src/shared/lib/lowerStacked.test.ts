import { describe, expect, it } from "vitest";
import { lowerStacked } from "./lowerStacked";
import { STACK_DESK, stackBox } from "./stackFixtures";

describe("lowerStacked", () => {
  const top = stackBox("top", { x: 300, z: 200, elevation: 73, parentId: "desk" });
  const topmost = stackBox("topmost", { x: 300, z: 200, elevation: 113, parentId: "top" });

  it("바닥에 놓인 받침 가구가 빠지면 바로 위 가구는 바닥으로, 그 위 가구는 받침 가구 그대로 같이 내려온다", () => {
    const lowered = lowerStacked([STACK_DESK, top, topmost], STACK_DESK);
    expect(lowered[1]).toMatchObject({ elevation: 0 });
    expect(lowered[1]?.parentId).toBeUndefined();
    expect(lowered[2]).toMatchObject({ elevation: 40, parentId: "top" });
  });

  it("받침 가구가 다른 가구 위에 있었으면 바로 위 가구는 그 가구 위에 놓인다", () => {
    const table = stackBox("table", { type: "table", x: 300, z: 200, w: 150, d: 80, h: 70 });
    const desk = { ...STACK_DESK, elevation: 70, parentId: "table" };
    const onDesk = { ...top, elevation: 143 };
    expect(lowerStacked([table, desk, onDesk], desk)[2]).toMatchObject({
      elevation: 70,
      parentId: "table",
    });
  });

  it("엣지: 그 위에 아무것도 없으면 가구는 그대로다", () => {
    const floorBox = stackBox("floor");
    expect(lowerStacked([STACK_DESK, floorBox], STACK_DESK)[1]).toBe(floorBox);
  });
});
