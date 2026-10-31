import { describe, expect, it } from "vitest";
import type { Box, Item } from "@/shared/types";
import { sameSlotItems } from "./sameSlotItems";

const items: Item[] = [
  { id: "a", name: "여권", slot: 1 },
  { id: "b", name: "비상금", slot: 1 },
  { id: "c", name: "양말", slot: 2 },
  { id: "d", name: "충전기" },
  { id: "e", name: "보조배터리" },
];
const box: Box = {
  id: "box_1",
  name: "서랍장",
  type: "drawer",
  x: 0,
  z: 0,
  rotation: 0,
  w: 80,
  d: 45,
  h: 90,
  elevation: 0,
  rows: 3,
  cols: 1,
  items,
};
const namesFor = (index: number) => {
  const item = items[index];
  return item ? sameSlotItems({ box, item }).map((other) => other.name) : [];
};

describe("sameSlotItems", () => {
  it("같은 칸의 다른 물건만 고르고 찾은 물건은 뺀다", () => {
    expect(namesFor(0)).toEqual(["비상금"]);
  });

  it("칸 없음 물건은 칸 없음 물건끼리 같은 칸이다", () => {
    expect(namesFor(3)).toEqual(["보조배터리"]);
  });

  it("엣지: 같은 칸에 다른 물건이 없으면 빈 목록", () => {
    expect(namesFor(2)).toEqual([]);
  });
});
