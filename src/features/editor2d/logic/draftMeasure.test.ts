import { describe, expect, it } from "vitest";
import { draftMeasure } from "./draftMeasure";

const P = (x: number, y: number) => ({ x, y });
const BASE = {
  box: { x: -50, y: -50, width: 700, height: 550, cmPerPx: 1 },
  gap: 10,
  fontSize: 20, // 글자 상자 높이 절반 10
};
const RECT = [P(100, 50), P(400, 50), P(400, 300), P(100, 300), P(100, 50)];

describe("draftMeasure", () => {
  it("직선: 찍은 점 → 커서 길이를 선분 위쪽에 보인다", () => {
    expect(
      draftMeasure({ ...BASE, tool: "line", draft: [P(100, 100)], cursor: P(400, 100) }),
    ).toEqual({ text: "3.0 m", at: P(250, 80) });
  });

  it("연속선: 지금 그리는 마지막 선분 길이만 보인다", () => {
    const draft = [P(0, 0), P(300, 0)];
    expect(draftMeasure({ ...BASE, tool: "polyline", draft, cursor: P(300, 120) })?.text).toBe(
      "1.2 m",
    );
  });

  it("사각형: 가운데에 '가로 × 세로'를 보인다", () => {
    expect(draftMeasure({ ...BASE, tool: "rect", draft: RECT, cursor: P(0, 0) })).toEqual({
      text: "3.0 × 2.5 m",
      at: P(250, 175),
    });
  });

  it("엣지: 그리던 점이나 커서가 없으면 null", () => {
    expect(draftMeasure({ ...BASE, tool: "line", draft: [], cursor: P(1, 1) })).toBeNull();
    expect(draftMeasure({ ...BASE, tool: "line", draft: [P(1, 1)], cursor: null })).toBeNull();
    expect(draftMeasure({ ...BASE, tool: "rect", draft: [], cursor: null })).toBeNull();
  });

  it("엣지: 커서가 찍은 점 자리(길이 0)면 null", () => {
    expect(
      draftMeasure({ ...BASE, tool: "line", draft: [P(100, 100)], cursor: P(100, 100) }),
    ).toBeNull();
  });
});
