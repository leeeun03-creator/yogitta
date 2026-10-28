import { describe, expect, it } from "vitest";
import { gridLines } from "./gridLines";

describe("gridLines", () => {
  it("600cm 바닥은 50cm마다 11개 (양 끝 제외)", () => {
    expect(gridLines(600)).toEqual([50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550]);
  });

  it("50cm로 나누어떨어지지 않는 455cm 바닥은 450까지", () => {
    const lines = gridLines(455);
    expect(lines).toHaveLength(9);
    expect(lines.at(-1)).toBe(450);
  });

  it("가장 작은 100cm 바닥은 가운데 1개", () => {
    expect(gridLines(100)).toEqual([50]);
  });

  it("가장 큰 3000cm 바닥은 59개", () => {
    expect(gridLines(3000)).toHaveLength(59);
  });

  it("간격보다 짧거나 간격이 0 이하면 선이 없다", () => {
    expect(gridLines(40)).toEqual([]);
    expect(gridLines(600, 0)).toEqual([]);
  });
});
