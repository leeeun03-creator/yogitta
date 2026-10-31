import { describe, expect, it } from "vitest";
import { mixColor } from "./mixColor";

describe("mixColor", () => {
  it("ratio만큼 to 쪽으로 섞는다 (55%: 가구 나무 톤을 3D 바탕색 쪽으로 흐리게)", () => {
    expect(mixColor("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(mixColor("#A6754D", "#FBF6EE", 0.55)).toBe("#D5BCA6"); // 파랑 77 + (238 - 77) × 0.55 = 165.55 → 166
  });

  it("엣지: 0이면 from 그대로, 1이면 to (대문자로 돌려준다)", () => {
    expect(mixColor("#a6754d", "#fbf6ee", 0)).toBe("#A6754D");
    expect(mixColor("#a6754d", "#fbf6ee", 1)).toBe("#FBF6EE");
  });

  it("엣지: 색 형식이 아니면 알린다", () => {
    expect(() => mixColor("A6754D", "#FBF6EE", 0.5)).toThrow();
    expect(() => mixColor("#A6754D", "#FFF", 0.5)).toThrow();
  });
});
