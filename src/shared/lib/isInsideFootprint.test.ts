import { describe, expect, it } from "vitest";
import { isInsideFootprint } from "./isInsideFootprint";
import { STACK_DESK } from "./stackFixtures";

describe("isInsideFootprint", () => {
  it("가구가 바닥에서 차지하는 사각형 안(가장자리 포함)인지 본다 (2D y = 3D z)", () => {
    expect(isInsideFootprint(STACK_DESK, { x: 360, y: 230 })).toBe(true);
    expect(isInsideFootprint(STACK_DESK, { x: 300, y: 231 })).toBe(false);
  });

  it("엣지: 90도 돌린 가구는 가로·깊이가 바뀐 사각형이다", () => {
    const turned = { ...STACK_DESK, rotation: 90 };
    expect(isInsideFootprint(turned, { x: 300, y: 255 })).toBe(true);
    expect(isInsideFootprint(turned, { x: 340, y: 200 })).toBe(false);
  });
});
