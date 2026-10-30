import { describe, expect, it } from "vitest";
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

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    expect(removeBox(original, "box_1").spaces[0]?.boxes).toEqual([]);
  });
});
