import { describe, expect, it } from "vitest";
import { roundTo } from "./roundTo";

describe("roundTo", () => {
  it("step 단위로 반올림한다", () => {
    expect(roundTo(133, 10)).toBe(130);
    expect(roundTo(136, 10)).toBe(140);
  });

  it("엣지: 반은 올리고, 음수도 반올림한다", () => {
    expect(roundTo(135, 10)).toBe(140);
    expect(roundTo(-14, 10)).toBe(-10);
  });

  it("엣지: step이 1이면 1cm 반올림이다", () => {
    expect(roundTo(12.6, 1)).toBe(13);
  });
});
