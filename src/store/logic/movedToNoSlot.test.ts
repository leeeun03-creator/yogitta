import { describe, expect, it } from "vitest";
import type { AppData, Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { changeBoxRows } from "./changeBoxRows";
import { changeBoxType } from "./changeBoxType";
import { movedToNoSlot } from "./movedToNoSlot";
import { deepFreeze } from "./spaceFixtures";

/** 서랍장(4칸)의 칸마다 물건: 1번째 서랍 여권, 4번째 서랍 양말·장갑, 칸 없음 책. */
function drawer(): AppData {
  const items: Item[] = [
    { id: "item_1", name: "여권", slot: 0 },
    { id: "item_2", name: "양말", slot: 3 },
    { id: "item_3", name: "장갑", slot: 3 },
    { id: "item_4", name: "책" },
  ];
  return deepFreeze(createBoxTestData([{ type: "drawer", rows: 4, items }]));
}

describe("movedToNoSlot", () => {
  it("칸 수를 줄여 사라진 칸의 물건 수를 센다 (원래 칸 없음 물건은 빼고)", () => {
    const before = drawer();
    expect(movedToNoSlot(before, changeBoxRows(before, "box_1", 3), "box_1")).toBe(2);
  });

  it("칸이 적은 종류로 바꾸면 그 칸 밖 물건을 센다 (보관함은 칸 하나)", () => {
    const before = drawer();
    expect(movedToNoSlot(before, changeBoxType(before, "box_1", "box"), "box_1")).toBe(2);
  });

  it("엣지: 사라진 칸이 비었거나 칸이 늘면 0", () => {
    const before = drawer();
    expect(movedToNoSlot(before, changeBoxRows(before, "box_1", 5), "box_1")).toBe(0);
    const three = changeBoxRows(before, "box_1", 3);
    const two = changeBoxRows(three, "box_1", 2);
    expect(movedToNoSlot(three, two, "box_1")).toBe(0); // 3번째 서랍은 비어 있었다
  });

  it("엣지: 없는 가구면 0", () => {
    const before = drawer();
    expect(movedToNoSlot(before, before, "box_9")).toBe(0);
  });
});
