import { describe, expect, it } from "vitest";
import { STACK_DESK } from "@/shared/lib/stackFixtures";
import { clampOntoBase } from "./clampOntoBase";

describe("clampOntoBase", () => {
  it("받침 가구 윗면(책상 x 240~360, y 170~230) 밖의 가운데는 가장자리로 당기고, 안이면 그대로다", () => {
    expect(clampOntoBase({ x: 400, y: 100 }, STACK_DESK)).toEqual({ x: 360, y: 170 });
    expect(clampOntoBase({ x: 250, y: 220 }, STACK_DESK)).toEqual({ x: 250, y: 220 });
  });

  it("엣지: 90도 돌린 받침 가구는 돌린 모양(60 × 120)으로 당긴다", () => {
    expect(clampOntoBase({ x: 400, y: 100 }, { ...STACK_DESK, rotation: 90 })).toEqual({
      x: 330,
      y: 140,
    });
  });
});
