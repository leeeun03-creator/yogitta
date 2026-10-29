import { describe, expect, it } from "vitest";
import { popoverPlacement } from "./popoverPlacement";

const VIEW = { width: 800, height: 600 };

describe("popoverPlacement", () => {
  it("누른 자리 바로 아래 가운데에 둔다", () => {
    expect(popoverPlacement({ x: 400, y: 200 }, VIEW)).toEqual({ x: 400 - 136, y: 212 });
  });

  it("엣지: 아래가 모자라면 누른 자리 위에 둔다", () => {
    expect(popoverPlacement({ x: 400, y: 560 }, VIEW)).toEqual({ x: 264, y: 560 - 12 - 64 });
  });

  it("엣지: 왼쪽·오른쪽 끝을 누르면 영역 안으로 당긴다", () => {
    expect(popoverPlacement({ x: 10, y: 200 }, VIEW).x).toBe(8);
    expect(popoverPlacement({ x: 795, y: 200 }, VIEW).x).toBe(800 - 8 - 272);
  });

  it("엣지: 영역이 입력칸보다 좁으면 가로는 가운데에 두고, 아래·위 모두 모자라면 위 여백에 붙인다", () => {
    const narrow = { width: 200, height: 100 };
    expect(popoverPlacement({ x: 100, y: 50 }, narrow)).toEqual({
      x: (8 + 200 - 8 - 272) / 2,
      y: 8,
    });
  });
});
