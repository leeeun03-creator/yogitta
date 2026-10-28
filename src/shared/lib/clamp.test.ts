import { describe, expect, it } from "vitest";
import { clamp } from "./clamp";

describe("clamp", () => {
  it("범위 안이면 그대로 둔다", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("범위 밖이면 가까운 끝으로 당긴다", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(12, 0, 10)).toBe(10);
  });

  it("엣지: 경계값은 그대로다", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("엣지: 범위가 뒤집혀 있으면 가운데를 준다", () => {
    expect(clamp(0, 68, 32)).toBe(50);
  });
});
