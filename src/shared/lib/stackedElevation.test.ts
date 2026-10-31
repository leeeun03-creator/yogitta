import { describe, expect, it } from "vitest";
import { STACK_DESK, stackBox } from "./stackFixtures";
import { stackedElevation } from "./stackedElevation";

describe("stackedElevation", () => {
  it("받침 가구 위면 받침 가구 설치 높이 + 높이다 (두 층이면 쌓인다)", () => {
    expect(stackedElevation(stackBox("small"), STACK_DESK)).toBe(73);
    const top = stackBox("top", { elevation: 73, parentId: "desk" });
    expect(stackedElevation(stackBox("small"), top)).toBe(113);
  });

  it("바닥에 두면 가구 위 가구였던 것은 0, 원래 바닥 가구는 그대로다 (벽걸이는 띄운 높이)", () => {
    expect(stackedElevation(stackBox("top", { elevation: 73, parentId: "desk" }), null)).toBe(0);
    expect(stackedElevation(stackBox("shelf", { type: "wall", elevation: 150 }), null)).toBe(150);
  });
});
