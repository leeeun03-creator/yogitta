import { describe, expect, it } from "vitest";
import { shadeColor } from "./shadeColor";

describe("shadeColor", () => {
  it("1배는 그대로, 0배는 검정이다", () => {
    expect(shadeColor("#F6EAD8", 1)).toBe("#F6EAD8");
    expect(shadeColor("#F6EAD8", 0)).toBe("#000000");
  });

  it("채널마다 곱하고 반올림한다", () => {
    // F6=246, EA=234, D8=216 → ×0.86 = 211.56, 201.24, 185.76 → D4, C9, BA
    expect(shadeColor("#F6EAD8", 0.86)).toBe("#D4C9BA");
    // ×0.74 = 182.04, 173.16, 159.84 → B6, AD, A0
    expect(shadeColor("#F6EAD8", 0.74)).toBe("#B6ADA0");
  });

  it("엣지: 소문자 색도 받고, 한 자리 값은 0을 붙인다", () => {
    expect(shadeColor("#0a0a0a", 0.5)).toBe("#050505");
  });

  it("엣지: 1보다 크면 255에서 멈추고, 음수는 0이다", () => {
    expect(shadeColor("#F0F0F0", 2)).toBe("#FFFFFF");
    expect(shadeColor("#F0F0F0", -1)).toBe("#000000");
  });

  it("엣지: 색 형식이 아니면 오류를 낸다", () => {
    expect(() => shadeColor("F6EAD8", 1)).toThrow();
    expect(() => shadeColor("#FFF", 1)).toThrow();
    expect(() => shadeColor("#GGGGGG", 1)).toThrow();
  });
});
