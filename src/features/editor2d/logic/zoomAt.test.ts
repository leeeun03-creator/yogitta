import { describe, expect, it } from "vitest";
import { ZOOM_MAX, ZOOM_MIN } from "@/shared/constants/floorPlan";
import { screenToCm } from "./screenToCm";
import { initialView, viewBoxOf } from "./viewBoxOf";
import { zoomAt } from "./zoomAt";

const FLOOR = { w: 600, h: 450 };
const VIEWPORT = { width: 1000, height: 800 };
const MARGIN = 50;

function setup(view = initialView(FLOOR)) {
  const box = viewBoxOf(FLOOR, VIEWPORT, MARGIN, view);
  return { view, box, viewport: VIEWPORT, floor: FLOOR };
}

describe("zoomAt", () => {
  it("줌해도 커서 아래 지점은 그대로다", () => {
    const input = setup();
    const anchor = { x: 200, y: 150 };
    const before = screenToCm(anchor, input.box);
    const view = zoomAt(input, 2, anchor);
    const after = screenToCm(anchor, viewBoxOf(FLOOR, VIEWPORT, MARGIN, view));
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it("최대·최소 줌에서 멈춘다", () => {
    let input = setup();
    for (let i = 0; i < 100; i++) input = setup(zoomAt(input, 1.2, { x: 500, y: 400 }));
    expect(input.view.zoom).toBe(ZOOM_MAX);
    for (let i = 0; i < 100; i++) input = setup(zoomAt(input, 1 / 1.2, { x: 500, y: 400 }));
    expect(input.view.zoom).toBe(ZOOM_MIN);
  });

  it("이미 최대면 같은 View를 그대로 돌려준다", () => {
    const input = setup({ ...initialView(FLOOR), zoom: ZOOM_MAX });
    expect(zoomAt(input, 2, { x: 10, y: 10 })).toBe(input.view);
  });
});
