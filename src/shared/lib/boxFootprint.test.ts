import { describe, expect, it } from "vitest";
import { boxFootprint } from "./boxFootprint";

describe("boxFootprint", () => {
  it("0도·180도면 가로·깊이 그대로 차지한다", () => {
    expect(boxFootprint({ w: 60, d: 50, rotation: 0 })).toEqual({ w: 60, d: 50 });
    expect(boxFootprint({ w: 60, d: 50, rotation: 180 })).toEqual({ w: 60, d: 50 });
  });

  it("90도·270도면 가로와 깊이가 바뀐다", () => {
    expect(boxFootprint({ w: 60, d: 50, rotation: 90 })).toEqual({ w: 50, d: 60 });
    expect(boxFootprint({ w: 60, d: 50, rotation: 270 })).toEqual({ w: 50, d: 60 });
  });
});
