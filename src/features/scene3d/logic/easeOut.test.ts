import { describe, expect, it } from "vitest";
import { easeOut } from "./easeOut";

describe("easeOut", () => {
  it("처음 0, 끝 1이고 앞쪽이 더 빨리 나아간다", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });

  it("엣지: 0~1 밖은 끝에 맞춘다", () => {
    expect(easeOut(-1)).toBe(0);
    expect(easeOut(2)).toBe(1);
  });
});
