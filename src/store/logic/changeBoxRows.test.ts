import { describe, expect, it } from "vitest";
import type { Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { changeBoxRows } from "./changeBoxRows";
import { deepFreeze } from "./spaceFixtures";

const rowsOf = (data: ReturnType<typeof createBoxTestData>) => data.spaces[0]?.boxes[0]?.rows;

describe("changeBoxRows", () => {
  it("양문 수납장·서랍장·선반·벽걸이의 칸 수를 바꾼다", () => {
    for (const type of ["cabinet", "drawer", "shelf", "wall"] as const) {
      const data = changeBoxRows(createBoxTestData([{ type, rows: 3 }]), "box_1", 5);
      expect(rowsOf(data), type).toBe(5);
    }
  });

  it("줄어든 칸의 물건은 칸 없음으로 옮기고 정해 둔 칸 높이는 지운다", () => {
    const items: Item[] = [
      { id: "item_1", name: "양말", slot: 1 },
      { id: "item_2", name: "여권", slot: 2 },
    ];
    const original = createBoxTestData([
      { type: "drawer", rows: 3, rowHeights: [30, 30, 30], items },
    ]);
    const box = changeBoxRows(original, "box_1", 2).spaces[0]?.boxes[0];
    expect(box?.items).toEqual([
      { id: "item_1", name: "양말", slot: 1 },
      { id: "item_2", name: "여권" },
    ]);
    expect(box).not.toHaveProperty("rowHeights");
  });

  it("엣지: 1칸 아래·8칸 위·소수·칸이 정해진 종류(책상·침대·보관함)는 그대로다", () => {
    const drawer = createBoxTestData([{ type: "drawer", rows: 3 }]);
    for (const rows of [0, 9, 2.5]) {
      expect(changeBoxRows(drawer, "box_1", rows), String(rows)).toBe(drawer);
    }
    expect(rowsOf(changeBoxRows(drawer, "box_1", 1))).toBe(1);
    expect(rowsOf(changeBoxRows(drawer, "box_1", 8))).toBe(8);
    for (const type of ["desk", "table", "bed", "box"] as const) {
      const fixed = createBoxTestData([{ type, rows: 1 }]);
      expect(changeBoxRows(fixed, "box_1", 2), type).toBe(fixed);
    }
  });

  it("엣지: 같은 칸 수·없는 가구면 원본 그대로이고, 원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{ type: "shelf", rows: 4 }]));
    expect(changeBoxRows(original, "box_1", 4)).toBe(original);
    expect(changeBoxRows(original, "box_9", 2)).toBe(original);
    expect(rowsOf(changeBoxRows(original, "box_1", 2))).toBe(2);
  });
});
