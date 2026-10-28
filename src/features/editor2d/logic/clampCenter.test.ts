import { describe, expect, it } from "vitest";
import { clampCenter } from "./clampCenter";

const FLOOR = { w: 600, h: 450 };

describe("clampCenter", () => {
  it("바닥 안의 점은 그대로 둔다", () => {
    expect(clampCenter({ x: 10, y: 20 }, FLOOR)).toEqual({ x: 10, y: 20 });
  });
});
