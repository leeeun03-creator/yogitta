import { describe, expect, it } from "vitest";
import { snapBoxCenter } from "./snapBoxCenter";

describe("snapBoxCenter", () => {
  it("왼쪽 위 모서리를 격자에 붙인 가운데를 준다", () => {
    expect(snapBoxCenter({ x: 213, y: 148 }, { w: 60, d: 50 }, 10)).toEqual({ x: 210, y: 145 });
  });

  it("엣지: 이미 격자에 붙어 있으면 그대로다", () => {
    expect(snapBoxCenter({ x: 130, y: 75 }, { w: 60, d: 50 }, 10)).toEqual({ x: 130, y: 75 });
  });
});
