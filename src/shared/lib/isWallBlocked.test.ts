import { describe, expect, it } from "vitest";
import type { Box, Point } from "@/shared/types";
import { isWallBlocked } from "./isWallBlocked";

// 가운데 (150, 150), 100 × 100: x 100 ~ 200, y 100 ~ 200
const box = (patch: Partial<Box> = {}): Box => ({
  id: "box_1",
  name: "보관함 1",
  type: "box",
  x: 150,
  z: 150,
  rotation: 0,
  w: 100,
  d: 100,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
  ...patch,
});
const open = (...points: Point[]) => ({ points, closed: false });

describe("isWallBlocked", () => {
  it("가구 한가운데를 지나가는 벽은 막힌다", () => {
    expect(isWallBlocked(open({ x: 150, y: 50 }, { x: 150, y: 300 }), [box()])).toBe(true);
  });

  it("가구와 떨어진 벽은 된다", () => {
    expect(isWallBlocked(open({ x: 300, y: 0 }, { x: 300, y: 450 }), [box()])).toBe(false);
  });

  it("엣지: 벽 면(두께 12cm의 절반)이 가구 면에 맞닿으면 되고, 1cm 파고들면 막힌다", () => {
    expect(isWallBlocked(open({ x: 206, y: 0 }, { x: 206, y: 450 }), [box()])).toBe(false);
    expect(isWallBlocked(open({ x: 205, y: 0 }, { x: 205, y: 450 }), [box()])).toBe(true);
  });

  it("엣지: 벽 끝도 각져서 두께 절반만큼 더 나온다 (끝이 가구 6cm 앞이면 맞닿음)", () => {
    expect(isWallBlocked(open({ x: 150, y: 0 }, { x: 150, y: 94 }), [box()])).toBe(false);
    expect(isWallBlocked(open({ x: 150, y: 0 }, { x: 150, y: 95 }), [box()])).toBe(true);
  });

  it("엣지: 가구를 둘러싼 사각형 벽은 되고, 닫힌 벽은 마지막 점 → 첫 점 선분도 본다", () => {
    const around = [
      { x: 90, y: 90 },
      { x: 210, y: 90 },
      { x: 210, y: 210 },
      { x: 90, y: 210 },
    ];
    expect(isWallBlocked({ points: around, closed: true }, [box()])).toBe(false);
    const corner = [
      { x: 50, y: 250 },
      { x: 250, y: 250 },
      { x: 250, y: 150 },
    ];
    expect(isWallBlocked({ points: corner, closed: false }, [box()])).toBe(false);
    expect(isWallBlocked({ points: corner, closed: true }, [box()])).toBe(true); // 비스듬히 가구를 지남
  });

  it("엣지: 90도 돌린 가구는 돌린 모양(가로·깊이를 바꾼)으로 본다", () => {
    const wall = open({ x: 180, y: 0 }, { x: 180, y: 450 }); // 벽 면 x 174 ~ 186
    expect(isWallBlocked(wall, [box({ w: 100, d: 40 })])).toBe(true); // x 100 ~ 200
    expect(isWallBlocked(wall, [box({ w: 100, d: 40, rotation: 90 })])).toBe(false); // x 130 ~ 170
  });

  it("엣지: 점이 하나뿐이거나 가구가 없으면 막히지 않는다", () => {
    expect(isWallBlocked(open({ x: 150, y: 150 }), [box()])).toBe(false);
    expect(isWallBlocked(open({ x: 150, y: 50 }, { x: 150, y: 300 }), [])).toBe(false);
  });

  it("엣지: 가구 여러 개 중 하나에만 파고들어도 막힌다", () => {
    const boxes = [box(), box({ id: "box_2", x: 450, z: 350 })];
    expect(isWallBlocked(open({ x: 300, y: 350 }, { x: 550, y: 350 }), boxes)).toBe(true);
  });
});
