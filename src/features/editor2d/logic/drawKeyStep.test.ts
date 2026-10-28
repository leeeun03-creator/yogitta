import { describe, expect, it } from "vitest";
import { drawKeyStep } from "./drawKeyStep";

const P = (x: number, y: number) => ({ x, y });
const TWO = [P(0, 0), P(100, 0)];

describe("drawKeyStep", () => {
  it("Esc는 어느 도구든 그리던 점을 버린다", () => {
    expect(drawKeyStep("line", [P(0, 0)], "Escape")).toEqual({ draft: [] });
    expect(drawKeyStep("polyline", TWO, "Escape")).toEqual({ draft: [] });
  });

  it("연속선 Enter는 열린 벽으로 끝낸다", () => {
    expect(drawKeyStep("polyline", TWO, "Enter")).toEqual({
      draft: [],
      wall: { tool: "polyline", points: TWO, closed: false },
    });
  });

  it("엣지: 연속선 점 1개에서 Enter는 벽을 만들지 않는다", () => {
    expect(drawKeyStep("polyline", [P(0, 0)], "Enter")).toEqual({ draft: [P(0, 0)] });
  });

  it("연속선 Backspace는 마지막 점을 취소한다", () => {
    expect(drawKeyStep("polyline", TWO, "Backspace")).toEqual({ draft: [P(0, 0)] });
  });

  it("그리는 중이 아니거나 관계없는 키는 null (다른 단축키를 막지 않는다)", () => {
    expect(drawKeyStep("polyline", [], "Escape")).toBeNull();
    expect(drawKeyStep("line", [P(0, 0)], "Enter")).toBeNull();
    expect(drawKeyStep("polyline", TWO, "a")).toBeNull();
  });
});
