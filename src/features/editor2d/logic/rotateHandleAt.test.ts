import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { rotateHandleAt } from "./rotateHandleAt";

const BOX: Box = {
  id: "box_1",
  name: "보관함 1",
  type: "box",
  x: 200,
  z: 125,
  rotation: 0,
  w: 200,
  d: 150,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
};

describe("rotateHandleAt", () => {
  it("0도면 정면(아래) 반대쪽인 위 가장자리에서 36px 위 (1px = 1cm)", () => {
    expect(rotateHandleAt(BOX, 1)).toEqual({ x: 200, y: 125 - 75 - 36 });
  });

  it("엣지: 90·180·270도면 핸들이 오른쪽·아래·왼쪽 (정면은 왼쪽·위·오른쪽)", () => {
    expect(rotateHandleAt({ ...BOX, rotation: 90 }, 1)).toEqual({ x: 200 + 111, y: 125 });
    expect(rotateHandleAt({ ...BOX, rotation: 180 }, 1)).toEqual({ x: 200, y: 125 + 111 });
    expect(rotateHandleAt({ ...BOX, rotation: 270 }, 1)).toEqual({ x: 200 - 111, y: 125 });
  });

  it("엣지: 줌하면 화면에서 같은 거리가 되게 cm가 바뀐다 (1px = 2cm면 72cm)", () => {
    expect(rotateHandleAt(BOX, 2)).toEqual({ x: 200, y: 125 - 75 - 72 });
  });
});
