import { describe, expect, it } from "vitest";
import { fitBoxPlacement } from "./fitBoxPlacement";

const FLOOR = { w: 600, h: 450 };

describe("fitBoxPlacement", () => {
  it("바닥 안에 들어가면 그대로다", () => {
    const placement = { center: { x: 130, y: 75 }, w: 60, d: 50 };
    expect(fitBoxPlacement(placement, FLOOR)).toEqual(placement);
  });

  it("엣지: 바닥 밖이면 가구 전체가 바닥 안에 들어오게 당긴다", () => {
    expect(fitBoxPlacement({ center: { x: -50, y: 9999 }, w: 60, d: 50 }, FLOOR)).toEqual({
      center: { x: 30, y: 425 },
      w: 60,
      d: 50,
    });
  });

  it("엣지: 바닥보다 크면 바닥 크기, 10cm보다 작거나 0·음수면 10cm다", () => {
    const big = fitBoxPlacement({ center: { x: 0, y: 0 }, w: 900, d: 700 }, FLOOR);
    expect(big).toEqual({ center: { x: 300, y: 225 }, w: 600, d: 450 });
    const tiny = fitBoxPlacement({ center: { x: 100, y: 100 }, w: 0, d: -20 }, FLOOR);
    expect(tiny).toMatchObject({ w: 10, d: 10 });
  });
});
