import { describe, expect, it } from "vitest";
import { screenToCm } from "./screenToCm";
import { initialView, viewBoxOf } from "./viewBoxOf";

const FLOOR = { w: 600, h: 450 };
const VIEWPORT = { width: 1000, height: 800 };
const MARGIN = 50;

function setup(view = initialView(FLOOR)) {
  const box = viewBoxOf(FLOOR, VIEWPORT, MARGIN, view);
  return { view, box, viewport: VIEWPORT, floor: FLOOR };
}

describe("screenToCm", () => {
  it("화면 가운데는 바닥 가운데다", () => {
    expect(screenToCm({ x: 500, y: 400 }, setup().box)).toEqual({ x: 300, y: 225 });
  });
});
