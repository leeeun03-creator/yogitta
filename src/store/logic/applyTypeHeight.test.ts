import { describe, expect, it } from "vitest";
import { applyTypeHeight } from "./applyTypeHeight";
import { createBoxTestData } from "./boxFixtures";
import { deepFreeze } from "./spaceFixtures";

describe("applyTypeHeight", () => {
  it("그 종류의 기본 높이로 바꾼다 (양문 수납장 180cm, 보관함 40cm)", () => {
    const data = applyTypeHeight(createBoxTestData([{ type: "cabinet" }, {}]), "box_1");
    expect(data.spaces[0]?.boxes[0]?.h).toBe(180);
    expect(applyTypeHeight(data, "box_2").spaces[0]?.boxes[1]?.h).toBe(40);
  });

  it("엣지: 정해 둔 칸 높이는 합이 맞지 않게 되니 지운다", () => {
    const original = createBoxTestData([{ type: "shelf", rows: 2, rowHeights: [50, 40] }]);
    const box = applyTypeHeight(original, "box_1").spaces[0]?.boxes[0];
    expect(box?.h).toBe(180);
    expect(box).not.toHaveProperty("rowHeights");
  });

  it("엣지: 이미 기본 높이이거나 없는 가구면 원본 그대로다", () => {
    const original = createBoxTestData([{ type: "drawer", h: 90 }]);
    expect(applyTypeHeight(original, "box_1")).toBe(original);
    expect(applyTypeHeight(original, "box_9")).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{ type: "desk" }]));
    expect(applyTypeHeight(original, "box_1").spaces[0]?.boxes[0]?.h).toBe(73);
  });
});
