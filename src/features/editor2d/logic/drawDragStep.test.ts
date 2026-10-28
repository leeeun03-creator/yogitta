import { describe, expect, it } from "vitest";
import { drawDragStep } from "./drawDragStep";

const P = (x: number, y: number) => ({ x, y });

describe("drawDragStep", () => {
  it("직선: 빈 상태에서 끌면 누른 점 → 뗀 점 벽이 된다", () => {
    expect(drawDragStep("line", [], P(0, 0), P(100, 0), 10)).toEqual({
      draft: [],
      wall: { tool: "line", points: [P(0, 0), P(100, 0)], closed: false },
    });
  });

  it("직선: 첫 점을 찍은 뒤 끌면 누른 자리는 버리고 첫 점 → 뗀 점 벽이 된다", () => {
    expect(drawDragStep("line", [P(0, 0)], P(50, 50), P(0, 100), 10)).toEqual({
      draft: [],
      wall: { tool: "line", points: [P(0, 0), P(0, 100)], closed: false },
    });
  });

  it("연속선: 빈 상태에서 끌면 점 2개로 시작한다", () => {
    expect(drawDragStep("polyline", [], P(0, 0), P(100, 0), 10)).toEqual({
      draft: [P(0, 0), P(100, 0)],
    });
  });

  it("연속선: 이어서 끌면 뗀 점을 이어 붙인다", () => {
    expect(drawDragStep("polyline", [P(0, 0), P(100, 0)], P(100, 0), P(100, 100), 10)).toEqual({
      draft: [P(0, 0), P(100, 0), P(100, 100)],
    });
  });

  it("연속선: 첫 점 근처에서 떼면 닫힌 벽이 된다", () => {
    const draft = [P(0, 0), P(100, 0), P(100, 100)];
    expect(drawDragStep("polyline", draft, P(100, 100), P(3, 3), 10)).toEqual({
      draft: [],
      wall: { tool: "polyline", points: draft, closed: true },
    });
  });

  it("연속선: 마지막 점에서 떼면 끝낸다", () => {
    const draft = [P(0, 0), P(100, 0)];
    expect(drawDragStep("polyline", draft, P(50, 50), P(100, 0), 10)).toEqual({
      draft: [],
      wall: { tool: "polyline", points: draft, closed: false },
    });
  });

  it("엣지: 빈 상태에서 누른 자리로 돌아와 떼면(길이 0) 점을 남기지 않는다", () => {
    expect(drawDragStep("line", [], P(10, 10), P(10, 10), 10)).toEqual({ draft: [] });
    expect(drawDragStep("polyline", [], P(10, 10), P(10, 10), 10)).toEqual({ draft: [] });
  });

  it("엣지: 그리던 점이 있으면 길이 0이어도 그리던 점은 그대로 둔다", () => {
    expect(drawDragStep("line", [P(0, 0)], P(9, 9), P(0, 0), 10)).toEqual({ draft: [P(0, 0)] });
  });

  it("끌어서 그리지 않는 도구(선택·사각형·지우개)는 그대로 둔다", () => {
    for (const tool of ["select", "rect", "eraser"] as const) {
      expect(drawDragStep(tool, [], P(0, 0), P(50, 50), 10)).toEqual({ draft: [] });
    }
  });
});
