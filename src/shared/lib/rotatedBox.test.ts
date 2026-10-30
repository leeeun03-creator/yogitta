import { describe, expect, it } from "vitest";
import type { Box, Wall } from "@/shared/types";
import { rotatedBox, type RotateResult } from "./rotatedBox";

const FLOOR = { w: 600, h: 450 };
const EMPTY = { floor: FLOOR, walls: [], boxes: [] };
const BOX: Box = {
  id: "box_1",
  name: "보관함 1",
  type: "box",
  x: 300,
  z: 200,
  rotation: 0,
  w: 60,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
};

/** 돌린 가구 (돌릴 수 없으면 테스트 실패). */
const turned = (result: RotateResult) => {
  if (!result.ok) throw new Error(`돌아야 한다: ${result.reason}`);
  return result.box;
};
const WALL: Wall = {
  id: "wall_1",
  tool: "line",
  points: [
    { x: 400, y: 0 },
    { x: 400, y: 450 },
  ],
  closed: false,
}; // 벽 면: x 394 · 406

describe("rotatedBox", () => {
  it("시계 방향으로 90도 돌리고, 자리가 넉넉하면 가운데는 그대로다", () => {
    expect(turned(rotatedBox(BOX, EMPTY))).toMatchObject({
      rotation: 90,
      x: 300,
      z: 200,
      w: 60,
      d: 50,
    });
  });

  it("엣지: 0 → 90 → 180 → 270 → 0도로 돈다", () => {
    const turns: number[] = [];
    let box: Box = BOX;
    for (let index = 0; index < 4; index++) {
      box = turned(rotatedBox(box, EMPTY));
      turns.push(box.rotation);
    }
    expect(turns).toEqual([90, 180, 270, 0]);
    expect(box).toMatchObject({ x: 300, z: 200 });
  });

  it("엣지: 바닥 가장자리에서 돌려 삐져나오면 바닥 안으로 민다", () => {
    // 200 × 40 가구를 아래쪽 경계에 붙여 두고 돌리면 세로 200이 되어 아래로 80 나간다
    const edge = { ...BOX, w: 200, d: 40, z: 430 };
    expect(turned(rotatedBox(edge, EMPTY))).toMatchObject({ rotation: 90, x: 300, z: 350 });
  });

  it("엣지: 돌린 모양이 바닥보다 길면 돌릴 수 없다 (tooLong)", () => {
    const long = { ...BOX, w: 500, d: 40, x: 300, z: 225 };
    expect(rotatedBox(long, EMPTY)).toEqual({ ok: false, reason: "tooLong" });
  });

  it("엣지: 정사각형 가구는 바닥과 같은 크기여도 돌린다", () => {
    const square = { ...BOX, w: 450, d: 450, x: 300, z: 225 };
    expect(turned(rotatedBox(square, EMPTY)).rotation).toBe(90);
  });

  it("엣지: 돌린 모양이 벽이나 다른 가구에 파고들면 돌릴 수 없다 (blocked)", () => {
    // 세로로 긴 40 × 200 가구가 벽 왼쪽 면(394)에 붙어 있으면, 돌리면 가로 200이 되어 벽을 뚫는다
    const tall = { ...BOX, w: 40, d: 200, x: 374, z: 200 }; // 오른쪽 면 394
    expect(rotatedBox(tall, { ...EMPTY, walls: [WALL] })).toEqual({ ok: false, reason: "blocked" });
    const other = { ...BOX, id: "box_2", x: 300, z: 280 }; // 아래쪽 가구
    const wide = { ...BOX, w: 200, d: 40, x: 300, z: 200 }; // 돌리면 세로 200 → 아래 가구를 뚫는다
    expect(rotatedBox(wide, { ...EMPTY, boxes: [wide, other] })).toEqual({
      ok: false,
      reason: "blocked",
    });
  });

  it("엣지: 돌려도 벽에 맞닿기만 하면 돌린다, 자기 자신은 막지 않는다", () => {
    // 60 × 60 정사각형은 돌려도 같은 모양이라 벽 면(394)에 붙어 있어도 돈다
    const square = { ...BOX, w: 60, d: 60, x: 364, z: 200 };
    expect(rotatedBox(square, { ...EMPTY, walls: [WALL], boxes: [square] }).ok).toBe(true);
  });

  it("원본 가구를 바꾸지 않는다", () => {
    const frozen = Object.freeze({ ...BOX });
    rotatedBox(frozen, EMPTY);
    expect(frozen.rotation).toBe(0);
  });
});
