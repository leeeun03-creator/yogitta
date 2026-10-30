import { describe, expect, it } from "vitest";
import { boxFromDrag } from "./boxFromDrag";

describe("boxFromDrag", () => {
  it("끈 사각형의 가운데와 가로·깊이를 준다", () => {
    expect(boxFromDrag({ x: 100, y: 50 }, { x: 160, y: 100 })).toEqual({
      center: { x: 130, y: 75 },
      w: 60,
      d: 50,
    });
  });

  it("엣지: 거꾸로(오른쪽 아래 → 왼쪽 위) 끌어도 같은 사각형이다", () => {
    expect(boxFromDrag({ x: 160, y: 100 }, { x: 100, y: 50 })).toEqual({
      center: { x: 130, y: 75 },
      w: 60,
      d: 50,
    });
  });

  it("엣지: 한 방향으로만 끌면 다른 방향은 누른 점에서 최소 10cm다", () => {
    expect(boxFromDrag({ x: 100, y: 50 }, { x: 200, y: 50 })).toEqual({
      center: { x: 150, y: 55 },
      w: 100,
      d: 10,
    });
  });

  it("엣지: 10cm보다 짧게 끌면 끈 쪽으로 10cm다", () => {
    expect(boxFromDrag({ x: 100, y: 50 }, { x: 96, y: 47 })).toEqual({
      center: { x: 95, y: 45 },
      w: 10,
      d: 10,
    });
  });
});
