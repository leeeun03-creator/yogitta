import { describe, expect, it } from "vitest";
import type { AppData, Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { deepFreeze } from "./spaceFixtures";
import { updateItem } from "./updateItem";

const PASSPORT: Item = { id: "item_1", name: "여권", slot: 0, memo: "파란 파우치" };
const SOCKS: Item = { id: "item_2", name: "양말", slot: 0 };

const BOOK: Item = { id: "item_3", name: "책" };

/** 서랍장 box_1(칸 0 ~ 2)의 1번째 서랍에 여권·양말, 보관함 box_2(칸 하나)에 책이 든 데이터. */
function drawer(): AppData {
  const data = createBoxTestData([{ type: "drawer", rows: 3 }, { type: "box" }]);
  const [mine, ...others] = data.spaces;
  const [first, second] = mine?.boxes ?? [];
  if (!mine || !first || !second) throw new Error("테스트 데이터가 없다");
  const boxes = [
    { ...first, items: [PASSPORT, SOCKS] },
    { ...second, items: [BOOK] },
  ];
  return deepFreeze({ ...data, spaces: [{ ...mine, boxes }, ...others] });
}
const itemsOf = (data: AppData, index = 0) => data.spaces[0]?.boxes[index]?.items;

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

  it("엣지: 없는 가구·없는 물건·없는 가구로 옮기기면 그대로 둔다", () => {
    const data = drawer();
    expect(updateItem(data, "box_9", { id: "item_1", name: "여권" })).toEqual({ ok: true, data });
    expect(updateItem(data, "box_1", { id: "item_9", name: "여권" })).toEqual({ ok: true, data });
    expect(updateItem(data, "box_1", PASSPORT, "box_9")).toEqual({ ok: true, data });
  });

  it("다른 가구로 옮기면 원래 가구에서 빼고 그 가구의 칸으로 맨 뒤에 넣는다 (고친 이름·메모도 함께)", () => {
    const result = updateItem(
      drawer(),
      "box_1",
      { ...PASSPORT, name: "여권 지갑", slot: 0 },
      "box_2",
    );
    expect(result.ok && itemsOf(result.data)).toEqual([SOCKS]);
    expect(result.ok && itemsOf(result.data, 1)).toEqual([
      BOOK,
      { id: "item_1", name: "여권 지갑", slot: 0, memo: "파란 파우치" },
    ]);
  });

  it("엣지: 옮길 가구의 칸 수 밖 칸이면 그 가구의 칸 없음에 넣는다", () => {
    const result = updateItem(drawer(), "box_1", { ...SOCKS, slot: 2 }, "box_2");
    expect(result.ok && itemsOf(result.data, 1)).toEqual([BOOK, { id: "item_2", name: "양말" }]);
  });

  it("엣지: 옮길 때도 빈 이름은 막는다", () => {
    expect(updateItem(drawer(), "box_1", { id: "item_1", name: "" }, "box_2")).toEqual({
      ok: false,
      reason: "emptyName",
    });
  });
});
