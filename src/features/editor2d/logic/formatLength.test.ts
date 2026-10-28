import { describe, expect, it } from "vitest";
import { formatLength } from "./formatLength";

describe("formatLength", () => {
  it("10cm 단위 길이는 소수 한 자리 m로 쓴다", () => {
    expect(formatLength(120)).toBe("1.2 m");
    expect(formatLength(300)).toBe("3.0 m");
  });

  it("10cm 단위가 아니면 소수 두 자리로 cm까지 보인다", () => {
    expect(formatLength(123)).toBe("1.23 m");
    expect(formatLength(35)).toBe("0.35 m");
  });

  it("가로·세로를 주면 '가로 × 세로 m'로 쓴다", () => {
    expect(formatLength(300, 250)).toBe("3.0 × 2.5 m");
  });

  it("cm 아래는 반올림한다 (대각선 길이)", () => {
    expect(formatLength(141.42)).toBe("1.41 m");
    expect(formatLength(499.6)).toBe("5.0 m");
  });

  it("음수(거꾸로 끈 사각형)도 길이로 쓴다", () => {
    expect(formatLength(-300, -250)).toBe("3.0 × 2.5 m");
  });

  it("엣지: 길이 0이거나 반올림해서 0이면 null", () => {
    expect(formatLength(0)).toBeNull();
    expect(formatLength(0.4)).toBeNull();
    expect(formatLength(300, 0)).toBeNull();
  });
});
