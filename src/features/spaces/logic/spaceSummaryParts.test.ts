import { describe, expect, it } from "vitest";
import type { Box, Space } from "@/shared/types";
import { spaceSummaryParts } from "./spaceSummaryParts";

const space = (floor: Space["floor"], boxes: Box[] = []): Space => ({
  id: "space_1",
  name: "내 방",
  floor,
  rooms: [],
  walls: [],
  boxes,
});
const box = (items: number): Box => ({
  id: `box_${items}`,
  name: `가구 ${items}`,
  type: "box",
  x: 0,
  z: 0,
  rotation: 0,
  w: 60,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: Array.from({ length: items }, (_, index) => ({ id: `item_${index}`, name: "양말" })),
});

describe("spaceSummaryParts", () => {
  it("바닥 크기(m)·가구 수·물건 수 조각을 돌려준다", () => {
    expect(spaceSummaryParts(space({ w: 600, h: 450 }, [box(2), box(3)]))).toEqual([
      "6.0 × 4.5 m",
      "가구 2",
      "물건 5",
    ]);
  });

  it("엣지: 가구가 없으면 0, 물건 없는 가구도 가구로 센다", () => {
    expect(spaceSummaryParts(space({ w: 1000, h: 700 }))).toEqual([
      "10.0 × 7.0 m",
      "가구 0",
      "물건 0",
    ]);
    expect(spaceSummaryParts(space({ w: 455, h: 100 }, [box(0)]))).toEqual([
      "4.55 × 1.0 m",
      "가구 1",
      "물건 0",
    ]);
  });
});
