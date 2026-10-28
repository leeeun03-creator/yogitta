import { describe, expect, it } from "vitest";
import { distance } from "./distance";

describe("distance", () => {
  it("3-4-5 직각삼각형의 빗변은 5", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("같은 점은 0, 순서를 바꿔도 같다", () => {
    expect(distance({ x: 7, y: 7 }, { x: 7, y: 7 })).toBe(0);
    expect(distance({ x: -1, y: 2 }, { x: 5, y: -6 })).toBe(
      distance({ x: 5, y: -6 }, { x: -1, y: 2 }),
    );
  });
});
