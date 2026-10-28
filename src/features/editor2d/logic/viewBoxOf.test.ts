import { describe, expect, it } from "vitest";
import { initialView, viewBoxOf } from "./viewBoxOf";

const FLOOR = { w: 600, h: 450 };
const VIEWPORT = { width: 1000, height: 800 };
const MARGIN = 50;

function setup(view = initialView(FLOOR)) {
  const box = viewBoxOf(FLOOR, VIEWPORT, MARGIN, view);
  return { view, box, viewport: VIEWPORT, floor: FLOOR };
}

describe("viewBoxOf", () => {
  it("처음 보기는 바닥이 화면 가운데에 꽉 찬다", () => {
    const { box } = setup();
    expect(box.x + box.width / 2).toBeCloseTo(300);
    expect(box.y + box.height / 2).toBeCloseTo(225);
    expect(box.cmPerPx).toBeCloseTo(600 / 900); // 가로가 먼저 꽉 찬다
  });

  it("zoom 2면 1px이 절반 cm가 된다", () => {
    const fitted = setup().box.cmPerPx;
    expect(setup({ ...initialView(FLOOR), zoom: 2 }).box.cmPerPx).toBeCloseTo(fitted / 2);
  });
});
