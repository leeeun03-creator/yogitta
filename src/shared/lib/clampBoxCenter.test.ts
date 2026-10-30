import { describe, expect, it } from "vitest";
import { clampBoxCenter } from "./clampBoxCenter";

const FLOOR = { w: 600, h: 450 };
const SIZE = { w: 60, d: 50 };

describe("clampBoxCenter", () => {
  it("바닥 안에 들어가면 그대로 둔다", () => {
    expect(clampBoxCenter({ x: 300, y: 200 }, SIZE, FLOOR)).toEqual({ x: 300, y: 200 });
  });

  it("엣지: 바닥 밖으로 나가면 가구 가장자리가 바닥 경계에 닿는 자리로 당긴다", () => {
    expect(clampBoxCenter({ x: -100, y: 1000 }, SIZE, FLOOR)).toEqual({ x: 30, y: 425 });
    expect(clampBoxCenter({ x: 590, y: 10 }, SIZE, FLOOR)).toEqual({ x: 570, y: 25 });
  });

  it("엣지: 가구가 바닥과 같은 크기면 바닥 가운데다", () => {
    expect(clampBoxCenter({ x: 0, y: 0 }, { w: 600, d: 450 }, FLOOR)).toEqual({ x: 300, y: 225 });
  });

  it("엣지: 가구가 바닥보다 큰 방향은 바닥 가운데, 다른 방향은 그대로 당긴다", () => {
    expect(clampBoxCenter({ x: 10, y: 10 }, { w: 700, d: 50 }, FLOOR)).toEqual({ x: 300, y: 25 });
  });
});
