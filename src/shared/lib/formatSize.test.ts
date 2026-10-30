import { describe, expect, it } from "vitest";
import { formatSize } from "./formatSize";

describe("formatSize", () => {
  it("가로 × 깊이를 cm로 잇는다", () => {
    expect(formatSize(60, 50)).toBe("60 × 50 cm");
  });

  it("세 값(가로 × 깊이 × 높이)도 잇는다", () => {
    expect(formatSize(60, 50, 90)).toBe("60 × 50 × 90 cm");
  });

  it("엣지: 소수는 1cm로 반올림한다", () => {
    expect(formatSize(59.6, 50.4)).toBe("60 × 50 cm");
  });
});
