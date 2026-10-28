import { describe, expect, it } from "vitest";
import { drawTapStep } from "./drawTapStep";

const P = (x: number, y: number) => ({ x, y });

describe("drawTapStep", () => {
  it("직선: 둘째 점에서 line 벽이 된다", () => {
    expect(drawTapStep("line", [P(0, 0)], P(100, 0), 10)).toEqual({
      draft: [],
      wall: { tool: "line", points: [P(0, 0), P(100, 0)], closed: false },
    });
  });

  it("연속선: 첫 점 근처를 누르면 닫힌 polyline 벽이 된다", () => {
    const draft = [P(0, 0), P(100, 0), P(100, 100)];
    expect(drawTapStep("polyline", draft, P(2, 2), 10)).toEqual({
      draft: [],
      wall: { tool: "polyline", points: draft, closed: true },
    });
  });

  it("누르기로 그리지 않는 도구(선택·사각형·지우개)는 그대로 둔다", () => {
    for (const tool of ["select", "rect", "eraser"] as const) {
      expect(drawTapStep(tool, [P(1, 1)], P(50, 50), 10)).toEqual({ draft: [P(1, 1)] });
    }
  });
});
