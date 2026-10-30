import { describe, expect, it } from "vitest";
import type { AppData, Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { deepFreeze } from "./spaceFixtures";
import { updateItem } from "./updateItem";

const PASSPORT: Item = { id: "item_1", name: "여권", slot: 0, memo: "파란 파우치" };
const SOCKS: Item = { id: "item_2", name: "양말", slot: 0 };

/** 서랍장(칸 0 ~ 2)의 1번째 서랍에 여권·양말이 든 데이터. */
function drawer(): AppData {
  const data = createBoxTestData([{ type: "drawer", rows: 3 }]);
  const space = data.spaces[0];
  const box = space?.boxes[0];
  if (!space || !box) throw new Error("테스트 데이터가 없다");
  return deepFreeze({
    ...data,
    spaces: [{ ...space, boxes: [{ ...box, items: [PASSPORT, SOCKS] }] }],
  });
}
const itemsOf = (data: AppData) => data.spaces[0]?.boxes[0]?.items;

describe("updateItem", () => {
  it("이름·메모를 고친다 (앞뒤 공백을 지우고, 넣은 순서는 그대로)", () => {
    const result = updateItem(drawer(), "box_1", {
      id: "item_1",
      name: " 여권 지갑 ",
      slot: 0,
      memo: " 서랍 안쪽 ",
    });
    expect(result.ok && itemsOf(result.data)).toEqual([
      { id: "item_1", name: "여권 지갑", slot: 0, memo: "서랍 안쪽" },
      SOCKS,
    ]);
  });

  it("칸을 바꾸면 같은 가구의 그 칸으로 옮기고, 칸을 안 고르면 칸 없음으로, 빈 메모는 메모 없음으로", () => {
    const moved = updateItem(drawer(), "box_1", { id: "item_1", name: "여권", slot: 2 });
    expect(moved.ok && itemsOf(moved.data)?.[0]).toEqual({ id: "item_1", name: "여권", slot: 2 });
    const noSlot = updateItem(drawer(), "box_1", { id: "item_2", name: "양말", memo: "  " });
    expect(noSlot.ok && itemsOf(noSlot.data)?.[1]).toEqual({ id: "item_2", name: "양말" });
  });

  it("엣지: 바꾼 것이 없으면 data를 그대로 돌려준다 (되돌리기 기록 없음)", () => {
    const data = drawer();
    const result = updateItem(data, "box_1", { ...PASSPORT, name: " 여권 " });
    expect(result.ok && result.data).toBe(data);
  });

  it("엣지: 빈 이름·31자 이름·101자 메모는 막고 까닭을 돌려준다", () => {
    const data = drawer();
    expect(updateItem(data, "box_1", { id: "item_1", name: "  " })).toEqual({
      ok: false,
      reason: "emptyName",
    });
    expect(updateItem(data, "box_1", { id: "item_1", name: "가".repeat(31) })).toEqual({
      ok: false,
      reason: "tooLong",
    });
    expect(
      updateItem(data, "box_1", { id: "item_1", name: "여권", memo: "가".repeat(101) }),
    ).toEqual({ ok: false, reason: "memoTooLong" });
  });

  it("엣지: 없는 가구·없는 물건이면 그대로 둔다", () => {
    const data = drawer();
    expect(updateItem(data, "box_9", { id: "item_1", name: "여권" })).toEqual({ ok: true, data });
    expect(updateItem(data, "box_1", { id: "item_9", name: "여권" })).toEqual({ ok: true, data });
  });
});
