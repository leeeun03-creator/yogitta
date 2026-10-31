import { describe, expect, it } from "vitest";
import { baseOf } from "./baseOf";
import { STACK_DESK, stackBox } from "./stackFixtures";

describe("baseOf", () => {
  it("가구 위 가구면 받침 가구, 바닥 가구면 undefined", () => {
    const top = stackBox("top", { elevation: 73, parentId: "desk" });
    expect(baseOf(top, [STACK_DESK, top])).toBe(STACK_DESK);
    expect(baseOf(STACK_DESK, [STACK_DESK, top])).toBeUndefined();
  });

  it("엣지: 받침 가구를 찾을 수 없으면(깨진 데이터) undefined", () => {
    expect(baseOf(stackBox("top", { parentId: "gone" }), [STACK_DESK])).toBeUndefined();
  });
});
