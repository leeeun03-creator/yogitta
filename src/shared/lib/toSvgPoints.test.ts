import { describe, expect, it } from "vitest";
import { toSvgPoints } from "./toSvgPoints";

describe("toSvgPoints", () => {
  it("점 목록을 'x,y x,y' 글자로 잇는다", () => {
    expect(
      toSvgPoints([
        { x: 0, y: 0 },
        { x: 10.5, y: -3 },
      ]),
    ).toBe("0,0 10.5,-3");
  });

  it("엣지: 빈 목록은 빈 글자", () => {
    expect(toSvgPoints([])).toBe("");
  });
});
