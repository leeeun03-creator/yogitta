import { describe, expect, it } from "vitest";
import type { Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { removeItem } from "./removeItem";
import { deepFreeze } from "./spaceFixtures";

const ITEMS: Item[] = [
  { id: "item_1", name: "여권", slot: 1 },
  { id: "item_2", name: "충전기", slot: 1 },
];

describe("removeItem", () => {
  it("그 물건만 뺀다", () => {
    const data = removeItem(createBoxTestData([{ items: ITEMS }]), "box_1", "item_1");
    expect(data.spaces[0]?.boxes[0]?.items).toEqual([{ id: "item_2", name: "충전기", slot: 1 }]);
  });

  it("엣지: 없는 물건·없는 가구면 원본 그대로이고, 원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{ items: ITEMS }]));
    expect(removeItem(original, "box_1", "item_9")).toBe(original);
    expect(removeItem(original, "box_9", "item_1")).toBe(original);
    expect(removeItem(original, "box_1", "item_2").spaces[0]?.boxes[0]?.items).toHaveLength(1);
  });
});
