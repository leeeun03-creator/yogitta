import { describe, expect, it } from "vitest";
import type { Box, Item, Space } from "@/shared/types";
import { matchItems } from "./matchItems";

const box = (id: string, items: Item[]): Box => ({
  id,
  name: id,
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
  items,
});
const space = (id: string, boxes: Box[]): Space => ({
  id,
  name: id,
  floor: { w: 600, h: 450 },
  rooms: [],
  walls: [],
  boxes,
});

const PADDING: Item = { id: "item_1", name: "작년 겨울 패딩" };
const CHARGER: Item = { id: "item_2", name: "USB 충전기", memo: "여권 옆" };
const PASSPORT: Item = { id: "item_3", name: "여권", memo: "파란 파우치" };
const SPACES = [space("내 방", [box("서랍장", [PADDING, CHARGER]), box("보관함", [PASSPORT])])];
const names = (query: string) => matchItems(SPACES, query).map((match) => match.item.name);

describe("matchItems", () => {
  it("이름 일부로 찾고, 어느 공간·가구인지 알려 준다", () => {
    expect(matchItems(SPACES, "패딩")).toEqual([
      { space: SPACES[0], box: SPACES[0]?.boxes[0], item: PADDING, byName: true },
    ]);
  });

  it("띄어쓰기를 무시한다 (겨울패딩 → 작년 겨울 패딩, 검색어 쪽 띄어쓰기도)", () => {
    expect(names("겨울패딩")).toEqual(["작년 겨울 패딩"]);
    expect(names(" 작년겨울 패 딩 ")).toEqual(["작년 겨울 패딩"]);
  });

  it("메모로도 찾고, 이름에 맞은 물건이 먼저다", () => {
    expect(names("파우치")).toEqual(["여권"]);
    expect(names("여권")).toEqual(["여권", "USB 충전기"]); // 충전기는 메모 "여권 옆"
  });

  it("엣지: 영어 대소문자를 무시한다", () => {
    expect(names("usb")).toEqual(["USB 충전기"]);
  });

  it("엣지: 빈 검색어·공백만·없는 이름이면 없다", () => {
    expect(names("")).toEqual([]);
    expect(names("   ")).toEqual([]);
    expect(names("선크림")).toEqual([]);
  });

  it("엣지: 여러 공간에서 찾는다", () => {
    const other = space("형 방", [box("형 책상", [{ id: "item_4", name: "여권" }])]);
    const found = matchItems([...SPACES, other], "여권").map((match) => match.space.name);
    expect(found).toEqual(["내 방", "형 방", "내 방"]);
  });
});
