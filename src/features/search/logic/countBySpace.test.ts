import { describe, expect, it } from "vitest";
import type { Box, Space } from "@/shared/types";
import { countBySpace } from "./countBySpace";
import type { ItemMatch } from "./matchItems";

const space = (id: string): Space => ({
  id,
  name: id,
  floor: { w: 600, h: 450 },
  rooms: [],
  walls: [],
  boxes: [],
});
const BOX: Box = {
  id: "box_1",
  name: "보관함",
  type: "box",
  x: 0,
  z: 0,
  rotation: 0,
  w: 50,
  d: 40,
  h: 40,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
};
const match = (at: Space, id: string): ItemMatch => ({
  space: at,
  box: BOX,
  item: { id, name: "여권" },
  byName: true,
});

describe("countBySpace", () => {
  it("공간마다 센다 (처음 나온 순서)", () => {
    const [brother, living] = [space("형 방"), space("거실")];
    const counts = countBySpace([match(brother, "a"), match(living, "b"), match(brother, "c")]);
    expect(counts.map(({ space: at, count }) => [at.name, count])).toEqual([
      ["형 방", 2],
      ["거실", 1],
    ]);
  });

  it("엣지: 찾은 것이 없으면 빈 목록", () => {
    expect(countBySpace([])).toEqual([]);
  });
});
