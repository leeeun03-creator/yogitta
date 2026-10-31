import { describe, expect, it } from "vitest";
import { formatCm } from "./formatCm";

describe("formatCm", () => {
  it("정수는 그대로, 소수는 소수 첫째 자리까지 보인다", () => {
    expect(formatCm(30)).toBe("30");
    expect(formatCm(22.5)).toBe("22.5");
    expect(formatCm(180 / 7)).toBe("25.7");
    expect(formatCm(29.96)).toBe("30");
  });
});
