import { describe, expect, it } from "vitest";
import { toFloorPoint } from "./toFloorPoint";
import { initialView, viewBoxOf } from "./viewBoxOf";

const FLOOR = { w: 600, h: 450 };
const VIEWPORT = { width: 1000, height: 800 };
const MARGIN = 50;
const box = (zoom = 1, center = initialView(FLOOR).center) =>
  viewBoxOf(FLOOR, VIEWPORT, MARGIN, { zoom, center });

describe("toFloorPoint", () => {
  it("화면 가운데는 바닥 가운데다", () => {
    expect(toFloorPoint({ x: 500, y: 400 }, box(), FLOOR)).toEqual({ x: 300, y: 225 });
  });

  it("1cm 단위로 반올림한다", () => {
    const point = toFloorPoint({ x: 500.4, y: 400.6 }, box(), FLOOR);
    expect(Number.isInteger(point.x) && Number.isInteger(point.y)).toBe(true);
  });

  it("줌·이동한 상태도 반영한다", () => {
    // 2배 줌 + 바닥 왼쪽 위(0, 0)를 화면 가운데에 둔 상태
    expect(toFloorPoint({ x: 500, y: 400 }, box(2, { x: 0, y: 0 }), FLOOR)).toEqual({ x: 0, y: 0 });
    const right = toFloorPoint({ x: 600, y: 400 }, box(2, { x: 0, y: 0 }), FLOOR);
    expect(right.x).toBe(Math.round(100 * box(2, { x: 0, y: 0 }).cmPerPx));
  });

  it("엣지: 바닥 밖은 가장 가까운 경계로 붙인다", () => {
    expect(toFloorPoint({ x: -999, y: -999 }, box(), FLOOR)).toEqual({ x: 0, y: 0 });
    expect(toFloorPoint({ x: 9999, y: 9999 }, box(), FLOOR)).toEqual({ x: 600, y: 450 });
  });
});
