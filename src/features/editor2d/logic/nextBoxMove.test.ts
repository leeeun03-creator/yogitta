import { describe, expect, it } from "vitest";
import { STACK_DESK, stackBox } from "@/shared/lib/stackFixtures";
import type { Box, Point } from "@/shared/types";
import { nextBoxMove, type BoxMove } from "./nextBoxMove";

// 책상: x 240~360, y 170~230 · 보관함(small): 40 × 30, 바닥 (100, 100)
const small = stackBox("small");
const step = (boxes: Box[], previous: BoxMove, target: Point, box = small) =>
  nextBoxMove({ box, space: { walls: [], boxes }, previous, target });
const ON_FLOOR: BoxMove = { center: { x: 100, y: 100 }, parentId: null };

describe("nextBoxMove", () => {
  it("가운데가 책상 윗면 안에 오면 책상 위로 올라간다", () => {
    expect(step([STACK_DESK, small], ON_FLOOR, { x: 300, y: 200 })).toEqual({
      center: { x: 300, y: 200 },
      parentId: "desk",
    });
  });

  it("책상 위에서 끌면 윗면 안에서 움직이고, 윗면 밖으로 끌어도 바닥에 자리가 없으면 가장자리에 머문다", () => {
    const top = { ...small, x: 300, z: 200, elevation: 73, parentId: "desk" };
    const onDesk: BoxMove = { center: { x: 300, y: 200 }, parentId: "desk" };
    expect(step([STACK_DESK, top], onDesk, { x: 340, y: 210 }, top)).toEqual({
      center: { x: 340, y: 210 },
      parentId: "desk",
    });
    // x 370: 가운데는 밖이지만 바닥에 두면 책상(오른쪽 면 360)과 겹친다 (보관함 왼쪽 면 350)
    expect(step([STACK_DESK, top], onDesk, { x: 370, y: 200 }, top)).toEqual({
      center: { x: 360, y: 200 },
      parentId: "desk",
    });
  });

  it("윗면 밖으로 끌어 바닥에 자리가 나면 바닥으로 내려온다", () => {
    const top = { ...small, x: 300, z: 200, elevation: 73, parentId: "desk" };
    const onDesk: BoxMove = { center: { x: 360, y: 200 }, parentId: "desk" };
    expect(step([STACK_DESK, top], onDesk, { x: 380, y: 200 }, top)).toEqual({
      center: { x: 380, y: 200 },
      parentId: null,
    });
  });

  it("엣지: 책상 위 자리가 막히면 올라가지 않고 바닥에서 책상 면에 붙는다 (책상 위 가구 위로는 올라간다)", () => {
    const other = stackBox("other", {
      x: 300,
      z: 200,
      w: 120,
      d: 60,
      elevation: 73,
      parentId: "desk",
    });
    // other도 받침 가구가 될 수 있어 그 위(113)로 올라간다
    expect(step([STACK_DESK, other, small], ON_FLOOR, { x: 300, y: 200 }).parentId).toBe("other");
    const shelf = stackBox("shelf", { type: "wall", x: 300, z: 200, w: 120, d: 60, elevation: 80 });
    const fromLeft: BoxMove = { center: { x: 200, y: 200 }, parentId: null };
    // 벽걸이(80~140)가 책상 위 자리(73~113)를 막는다
    expect(step([STACK_DESK, shelf, small], fromLeft, { x: 300, y: 200 })).toEqual({
      center: { x: 220, y: 200 },
      parentId: null,
    });
  });

  it("엣지: 벽걸이는 다른 가구 위로 올라가지 않는다", () => {
    const shelf = stackBox("shelf", { type: "wall", elevation: 150 });
    const fromFloor: BoxMove = { center: { x: 100, y: 100 }, parentId: null };
    expect(step([STACK_DESK, shelf], fromFloor, { x: 300, y: 200 }, shelf)).toEqual({
      center: { x: 300, y: 200 }, // 벽걸이(150~)는 책상(~73)과 높이가 겹치지 않아 그 위를 지나간다
      parentId: null,
    });
  });
});
