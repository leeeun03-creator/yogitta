import { describe, expect, it } from "vitest";
import { canStackOn } from "./canStackOn";
import { STACK_DESK, stackBox } from "./stackFixtures";

describe("canStackOn", () => {
  const small = stackBox("small");

  it("보관함은 책상 위에, 책상은 보관함 위에도 올릴 수 있다 (종류는 벽걸이만 막는다)", () => {
    expect(canStackOn([STACK_DESK, small], small, STACK_DESK)).toBe(true);
    expect(canStackOn([STACK_DESK, small], STACK_DESK, small)).toBe(true);
  });

  it("엣지: 벽걸이는 올라가지도, 받침 가구가 되지도 않는다", () => {
    const shelf = stackBox("shelf", { type: "wall", elevation: 150 });
    expect(canStackOn([STACK_DESK, shelf], shelf, STACK_DESK)).toBe(false);
    expect(canStackOn([small, shelf], small, shelf)).toBe(false);
  });

  it("엣지: 자기 자신이나 자기 위에 올린 가구(두 층 포함) 위로는 올라가지 않는다", () => {
    const top = stackBox("top", { parentId: "desk" });
    const topmost = stackBox("topmost", { parentId: "top" });
    const boxes = [STACK_DESK, top, topmost];
    expect(canStackOn(boxes, STACK_DESK, STACK_DESK)).toBe(false);
    expect(canStackOn(boxes, STACK_DESK, top)).toBe(false);
    expect(canStackOn(boxes, STACK_DESK, topmost)).toBe(false);
    expect(canStackOn(boxes, top, STACK_DESK)).toBe(true); // 이미 올라가 있어도 다시 놓을 수 있다
  });
});
