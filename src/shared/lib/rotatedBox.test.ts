import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { rotatedBox } from "./rotatedBox";

const FLOOR = { w: 600, h: 450 };
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

describe("rotatedBox", () => {
  it("시계 방향으로 90도 돌리고, 자리가 넉넉하면 가운데는 그대로다", () => {
    expect(rotatedBox(BOX, FLOOR)).toMatchObject({ rotation: 90, x: 300, z: 200, w: 60, d: 50 });
  });

  it("엣지: 0 → 90 → 180 → 270 → 0도로 돈다", () => {
    const turns: number[] = [];
    let box: Box | null = BOX;
    for (let index = 0; index < 4 && box; index++) {
      box = rotatedBox(box, FLOOR);
      turns.push(box?.rotation ?? -1);
    }
    expect(turns).toEqual([90, 180, 270, 0]);
    expect(box).toMatchObject({ x: 300, z: 200 });
  });

  it("엣지: 바닥 가장자리에서 돌려 삐져나오면 바닥 안으로 민다", () => {
    // 200 × 40 가구를 아래쪽 경계에 붙여 두고 돌리면 세로 200이 되어 아래로 80 나간다
    const edge = { ...BOX, w: 200, d: 40, z: 430 };
    expect(rotatedBox(edge, FLOOR)).toMatchObject({ rotation: 90, x: 300, z: 350 });
  });

  it("엣지: 돌린 모양이 바닥보다 길면 돌릴 수 없다 (null)", () => {
    const long = { ...BOX, w: 500, d: 40, x: 300, z: 225 };
    expect(rotatedBox(long, FLOOR)).toBeNull();
  });

  it("엣지: 정사각형 가구는 바닥과 같은 크기여도 돌린다", () => {
    const square = { ...BOX, w: 450, d: 450, x: 300, z: 225 };
    expect(rotatedBox(square, FLOOR)?.rotation).toBe(90);
  });

  it("원본 가구를 바꾸지 않는다", () => {
    const frozen = Object.freeze({ ...BOX });
    rotatedBox(frozen, FLOOR);
    expect(frozen.rotation).toBe(0);
  });
});
