import { describe, expect, it } from "vitest";
import { parseSize } from "./parseSize";

describe("parseSize", () => {
  it("세 칸 글자를 정수 cm로 읽는다 (앞뒤 공백 무시)", () => {
    expect(parseSize({ w: "120", d: " 60 ", h: "180" })).toEqual({ w: 120, d: 60, h: 180 });
  });

  it("엣지: 소수는 반올림하고 쉼표 소수점도 받는다", () => {
    expect(parseSize({ w: "60.4", d: "49,5", h: "90.5" })).toEqual({ w: 60, d: 50, h: 91 });
  });

  it("엣지: 하나라도 비었거나·공백만·숫자가 아니면 null", () => {
    for (const bad of ["", "  ", "abc", "6O", "1..2"]) {
      expect(parseSize({ w: bad, d: "50", h: "90" }), bad).toBeNull();
    }
  });

  it("엣지: 0·음수는 숫자라 읽어 두고, 막는 것은 크기 검사에 맡긴다", () => {
    expect(parseSize({ w: "0", d: "-5", h: "90" })).toEqual({ w: 0, d: -5, h: 90 });
  });
});
