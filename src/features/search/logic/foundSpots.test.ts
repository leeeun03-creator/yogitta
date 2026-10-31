import { describe, expect, it } from "vitest";
import type { Box, Item, Space } from "@/shared/types";
import { foundSpots } from "./foundSpots";
import type { ItemMatch } from "./matchItems";

const DRAWER: Box = {
  id: "box_1",
  name: "화장대 서랍장",
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
  items: [],
};
const SPACE: Space = {
  id: "space_1",
  name: "내 방",
  floor: { w: 600, h: 450 },
  rooms: [],
  walls: [],
  boxes: [],
};
const match = (item: Item): ItemMatch => ({ space: SPACE, box: DRAWER, item, byName: true });

describe("foundSpots", () => {
  it("가구·칸과 핀 라벨 글자를 만들고, 고른 결과만 isPicked", () => {
    const passport = match({ id: "item_1", name: "여권", slot: 1 });
    const socks = match({ id: "item_2", name: "양말", slot: 2 });
    expect(foundSpots([passport, socks], passport)).toEqual([
      {
        boxId: "box_1",
        slot: 1,
        itemName: "여권",
        place: "화장대 서랍장 · 2번째 서랍",
        isPicked: true,
      },
      {
        boxId: "box_1",
        slot: 2,
        itemName: "양말",
        place: "화장대 서랍장 · 3번째 서랍",
        isPicked: false,
      },
    ]);
  });

  it("엣지: 칸 없음·칸 수 밖이면 '칸 없음'이고 칸 번호는 없다", () => {
    const spots = foundSpots(
      [match({ id: "item_1", name: "선글라스" }), match({ id: "item_2", name: "양말", slot: 9 })],
      null,
    );
    expect(spots.map(({ slot, place, isPicked }) => [slot, place, isPicked])).toEqual([
      [undefined, "화장대 서랍장 · 칸 없음", false],
      [undefined, "화장대 서랍장 · 칸 없음", false],
    ]);
  });

  it("엣지: 찾은 것이 없으면 빈 목록", () => {
    expect(foundSpots([], null)).toEqual([]);
  });
});
