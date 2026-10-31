import { describe, expect, it } from "vitest";
import { parseCm } from "./parseCm";

describe("parseCm", () => {
  it("cm 글자를 정수 cm로 읽는다 (소수 반올림, 쉼표 소수점, 앞뒤 공백)", () => {
    expect(parseCm("20")).toBe(20);
    expect(parseCm(" 22,6 ")).toBe(23);
    expect(parseCm("-5")).toBe(-5); // 범위 검사는 바꾸는 쪽에서 한다
  });

  it("엣지: 비었거나 숫자가 아니면 null", () => {
    expect(parseCm("")).toBeNull();
    expect(parseCm("   ")).toBeNull();
    expect(parseCm("abc")).toBeNull();
  });
});
