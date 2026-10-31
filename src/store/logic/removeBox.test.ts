import { describe, expect, it } from "vitest";
import type { Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { removeBox } from "./removeBox";
import { deepFreeze } from "./spaceFixtures";

describe("removeBox", () => {
  it("그 가구만 지운다", () => {
    const data = removeBox(createBoxTestData([{}, {}]), "box_1");
    expect(data.spaces[0]?.boxes.map((box) => box.id)).toEqual(["box_2"]);
  });

  it("엣지: 마지막 가구를 지우면 가구 0개다", () => {
    expect(removeBox(createBoxTestData([{}]), "box_1").spaces[0]?.boxes).toEqual([]);
  });

  it("엣지: 없는 가구면 그대로 둔다 (되돌리기 기록이 늘지 않게)", () => {
    const original = createBoxTestData([{}]);
    expect(removeBox(original, "box_9")).toBe(original);
  });

  it("moveTo면 물건을 모두 그 가구의 칸 없음으로 옮기고(맨 뒤) 지운다", () => {
    const items: Item[] = [
      { id: "item_1", name: "여권", slot: 1 },
      { id: "item_2", name: "책" },
    ];
    const book: Item = { id: "item_3", name: "공책", slot: 0 };
    const original = deepFreeze(createBoxTestData([{ items }, { items: [book] }]));
    const boxes = removeBox(original, "box_1", "box_2").spaces[0]?.boxes;
    expect(boxes?.map((box) => box.id)).toEqual(["box_2"]);
    expect(boxes?.[0]?.items).toEqual([
      book,
      { id: "item_1", name: "여권" },
      { id: "item_2", name: "책" },
    ]);
  });

  it("엣지: moveTo가 없거나 없는 가구·자기 자신이면 물건도 같이 지운다", () => {
    const items: Item[] = [{ id: "item_1", name: "여권" }];
    const original = createBoxTestData([{ items }, {}]);
    for (const moveTo of [undefined, "box_9", "box_1"]) {
      const boxes = removeBox(original, "box_1", moveTo).spaces[0]?.boxes;
      expect(boxes).toEqual([original.spaces[0]?.boxes[1]]);
    }
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    expect(removeBox(original, "box_1").spaces[0]?.boxes).toEqual([]);
  });

  it("받침 가구를 지우면 그 위 가구(두 층 포함)는 받침 가구 높이만큼 내려와 남는다", () => {
    const data = createBoxTestData([
      {},
      { elevation: 90, parentId: "box_1" },
      { elevation: 180, parentId: "box_2" },
    ]);
    const boxes = removeBox(data, "box_1").spaces[0]?.boxes;
    expect(boxes?.map((box) => [box.id, box.elevation, box.parentId])).toEqual([
      ["box_2", 0, undefined],
      ["box_3", 90, "box_2"],
    ]);
  });

  it("withStacked면 그 위 가구(두 층 포함)도 물건까지 같이 지운다", () => {
    const data = createBoxTestData([
      {},
      { elevation: 90, parentId: "box_1", items: [{ id: "item_1", name: "충전기" }] },
      { elevation: 180, parentId: "box_2" },
      { x: 100, z: 100 },
    ]);
    const boxes = removeBox(data, "box_1", undefined, true).spaces[0]?.boxes;
    expect(boxes?.map((box) => box.id)).toEqual(["box_4"]);
  });

  it("엣지: 같이 지울 가구 위 가구로 물건을 옮기려 하면 물건도 같이 지워진다", () => {
    const items: Item[] = [{ id: "item_1", name: "여권" }];
    const data = createBoxTestData([{ items }, { elevation: 90, parentId: "box_1" }]);
    expect(removeBox(data, "box_1", "box_2", true).spaces[0]?.boxes).toEqual([]);
    // 내리면 남으니 그 가구로 옮겨진다
    const lowered = removeBox(data, "box_1", "box_2").spaces[0]?.boxes[0];
    expect(lowered?.items.map((item) => item.name)).toEqual(["여권"]);
  });
});
