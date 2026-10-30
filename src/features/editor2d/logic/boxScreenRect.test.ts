import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { boxScreenRect } from "./boxScreenRect";

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
const VIEW = { x: -50, y: -40, width: 700, height: 560, cmPerPx: 2 };

describe("boxScreenRect", () => {
  it("가구 사각형(cm)을 지금 보이는 범위 기준 화면 px로 바꾼다", () => {
    expect(boxScreenRect(BOX, VIEW)).toEqual({ left: 75, top: 45, width: 100, height: 75 });
  });

  it("엣지: 90도 돌린 가구는 가로·세로가 바뀐 사각형이다", () => {
    expect(boxScreenRect({ ...BOX, rotation: 90 }, VIEW)).toEqual({
      left: 87.5,
      top: 32.5,
      width: 75,
      height: 100,
    });
  });
});
