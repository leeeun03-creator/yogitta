import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { drawKeyStep } from "./drawKeyStep";
import { drawTapStep } from "./drawTapStep";
import { isDrawStepBlocked } from "./isDrawStepBlocked";

const CLOSE_RADIUS = 10;
// 가운데 (150, 150), 100 × 100: x 100 ~ 200, y 100 ~ 200
const BOXES: Box[] = [
  {
    id: "box_1",
    name: "보관함 1",
    type: "box",
    x: 150,
    z: 150,
    rotation: 0,
    w: 100,
    d: 100,
    h: 90,
    elevation: 0,
    rows: 1,
    cols: 1,
    items: [],
  },
];
const A = { x: 50, y: 50 };
const ACROSS = { x: 250, y: 250 }; // A에서 가구를 비스듬히 지난다
const BESIDE = { x: 250, y: 50 }; // A에서 가구 위쪽으로 지나간다 (벽 면 y 56)

describe("isDrawStepBlocked", () => {
  it("직선: 둘째 점이 가구를 지나가는 벽이 되면 막히고, 비켜 가면 된다", () => {
    expect(isDrawStepBlocked([A], drawTapStep("line", [A], ACROSS, CLOSE_RADIUS), BOXES)).toBe(
      true,
    );
    expect(isDrawStepBlocked([A], drawTapStep("line", [A], BESIDE, CLOSE_RADIUS), BOXES)).toBe(
      false,
    );
  });

  it("엣지: 첫 점은 가구 안을 눌러도 선분이 없어 막지 않는다", () => {
    const step = drawTapStep("line", [], { x: 150, y: 150 }, CLOSE_RADIUS);
    expect(isDrawStepBlocked([], step, BOXES)).toBe(false);
  });

  it("연속선: 가구를 지나가게 점을 더하면 막고, 비켜 가는 점은 된다", () => {
    const draft = [A, BESIDE];
    const across = drawTapStep("polyline", draft, { x: 50, y: 250 }, CLOSE_RADIUS);
    expect(isDrawStepBlocked(draft, across, BOXES)).toBe(true);
    const beside = drawTapStep("polyline", draft, { x: 250, y: 300 }, CLOSE_RADIUS);
    expect(isDrawStepBlocked(draft, beside, BOXES)).toBe(false);
  });

  it("엣지: 연속선을 첫 점에서 닫을 때 닫는 선분이 가구를 지나가면 막는다", () => {
    const draft = [
      { x: 50, y: 250 },
      { x: 50, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 50 },
    ];
    const close = drawTapStep("polyline", draft, { x: 50, y: 250 }, CLOSE_RADIUS);
    expect(close.wall?.closed).toBe(true);
    expect(isDrawStepBlocked(draft, close, BOXES)).toBe(true);
  });

  it("엣지: 막힌 그리던 선도 Backspace·Esc로 물릴 수 있다 (점을 지우기만 함)", () => {
    const draft = [A, ACROSS]; // 그리는 중에 되돌리기로 가구가 돌아와 막힌 선
    expect(
      isDrawStepBlocked(draft, drawKeyStep("polyline", draft, "Backspace") ?? { draft }, BOXES),
    ).toBe(false);
    expect(
      isDrawStepBlocked(draft, drawKeyStep("polyline", draft, "Escape") ?? { draft }, BOXES),
    ).toBe(false);
  });

  it("엣지: 점이 늘지 않는 누르기(점 2개에서 첫 점 누르기)도 막지 않는다", () => {
    const draft = [A, ACROSS];
    const step = drawTapStep("polyline", draft, A, CLOSE_RADIUS);
    expect(step.draft).toEqual(draft); // 점 2개로는 닫지 않는다
    expect(isDrawStepBlocked(draft, step, BOXES)).toBe(false);
  });

  it("엣지: Enter로 끝낸 벽도 가구를 지나가면 막는다", () => {
    const draft = [A, ACROSS];
    const step = drawKeyStep("polyline", draft, "Enter");
    expect(step?.wall).toBeDefined();
    expect(isDrawStepBlocked(draft, step ?? { draft }, BOXES)).toBe(true);
  });

  it("엣지: 가구가 없으면 막지 않는다", () => {
    expect(isDrawStepBlocked([A], drawTapStep("line", [A], ACROSS, CLOSE_RADIUS), [])).toBe(false);
  });
});
