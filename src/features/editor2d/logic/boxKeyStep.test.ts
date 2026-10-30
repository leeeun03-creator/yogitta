import { describe, expect, it } from "vitest";
import { boxKeyStep } from "./boxKeyStep";

describe("boxKeyStep", () => {
  it("방향키는 그 쪽으로 한 칸 (2D y는 아래가 +)", () => {
    expect(boxKeyStep("ArrowLeft")).toEqual({ x: -1, y: 0 });
    expect(boxKeyStep("ArrowRight")).toEqual({ x: 1, y: 0 });
    expect(boxKeyStep("ArrowUp")).toEqual({ x: 0, y: -1 });
    expect(boxKeyStep("ArrowDown")).toEqual({ x: 0, y: 1 });
  });

  it("엣지: 방향키가 아니면 null", () => {
    expect(boxKeyStep("Enter")).toBeNull();
    expect(boxKeyStep("a")).toBeNull();
  });
});
