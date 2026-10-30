import { describe, expect, it } from "vitest";
import type { AppData } from "@/shared/types";
import { addItem } from "./addItem";
import { createBoxTestData } from "./boxFixtures";
import { deepFreeze } from "./spaceFixtures";

const drawer = () => createBoxTestData([{ type: "drawer", rows: 3 }]); // 칸 0 ~ 2
const itemsOf = (data: AppData) => data.spaces[0]?.boxes[0]?.items;

describe("addItem", () => {
  it("이름·칸·메모로 물건을 넣는다 (앞뒤 공백을 지운다)", () => {
    const result = addItem(drawer(), "box_1", {
      id: "item_1",
      name: "  여권 ",
      slot: 1,
      memo: " 파란 파우치 안 ",
    });
    expect(result.ok && itemsOf(result.data)).toEqual([
      { id: "item_1", name: "여권", slot: 1, memo: "파란 파우치 안" },
    ]);
  });

  it("칸을 안 고르면 칸 없음에, 빈 메모는 메모 없음으로 넣는다", () => {
    const result = addItem(drawer(), "box_1", { id: "item_1", name: "선글라스", memo: "   " });
    expect(result.ok && itemsOf(result.data)).toEqual([{ id: "item_1", name: "선글라스" }]);
  });

  it("엣지: 칸 수 밖·음수·소수 칸은 칸 없음에 넣는다", () => {
    for (const slot of [3, -1, 1.5]) {
      const result = addItem(drawer(), "box_1", { id: "item_1", name: "양말", slot });
      expect(result.ok && itemsOf(result.data), String(slot)).toEqual([
        { id: "item_1", name: "양말" },
      ]);
    }
  });

  it("엣지: 빈 이름·공백만·31자 이름·101자 메모는 막는다 (30자·100자는 된다)", () => {
    const base = drawer();
    expect(addItem(base, "box_1", { id: "a", name: " " })).toEqual({
      ok: false,
      reason: "emptyName",
    });
    expect(addItem(base, "box_1", { id: "a", name: "가".repeat(31) })).toEqual({
      ok: false,
      reason: "tooLong",
    });
    expect(addItem(base, "box_1", { id: "a", name: "가", memo: "나".repeat(101) })).toEqual({
      ok: false,
      reason: "memoTooLong",
    });
    expect(
      addItem(base, "box_1", { id: "a", name: "가".repeat(30), memo: "나".repeat(100) }).ok,
    ).toBe(true);
  });

  it("엣지: 같은 칸에 같은 이름도 넣고, 이모지 이름도 된다", () => {
    const first = addItem(drawer(), "box_1", { id: "item_1", name: "충전기", slot: 0 });
    if (!first.ok) throw new Error("넣어져야 한다");
    const second = addItem(first.data, "box_1", { id: "item_2", name: "충전기", slot: 0 });
    const third = second.ok
      ? addItem(second.data, "box_1", { id: "item_3", name: "🔋 배터리" })
      : second;
    expect(third.ok && itemsOf(third.data)?.map((item) => item.name)).toEqual([
      "충전기",
      "충전기",
      "🔋 배터리",
    ]);
  });

  it("엣지: 없는 가구면 그대로이고, 원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(drawer());
    const missing = addItem(original, "box_9", { id: "item_1", name: "여권" });
    expect(missing.ok && missing.data).toBe(original);
    const added = addItem(original, "box_1", { id: "item_1", name: "여권" });
    expect(added.ok && itemsOf(added.data)).toHaveLength(1);
  });
});
