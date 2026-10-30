import { describe, expect, it } from "vitest";
import { createBoxTestData } from "./boxFixtures";
import { resizeBox } from "./resizeBox";
import { deepFreeze } from "./spaceFixtures";

describe("resizeBox", () => {
  it("현재 공간의 그 가구 크기를 바꾼다", () => {
    const result = resizeBox(createBoxTestData([{}]), "box_1", { w: 120, d: 60, h: 180 });
    expect(result.ok && result.data.spaces[0]?.boxes[0]).toMatchObject({ w: 120, d: 60, h: 180 });
  });

  it("막히면 데이터는 그대로이고 까닭을 돌려준다", () => {
    expect(resizeBox(createBoxTestData([{}]), "box_1", { w: 700, d: 50, h: 90 })).toEqual({
      ok: false,
      reason: "tooLong",
    });
  });

  it("엣지: 같은 크기·없는 가구면 원본 그대로다 (되돌리기 기록이 안 남는다)", () => {
    const original = createBoxTestData([{}]);
    const same = resizeBox(original, "box_1", { w: 60, d: 50, h: 90 });
    const missing = resizeBox(original, "box_9", { w: 100, d: 50, h: 90 });
    expect(same.ok && same.data).toBe(original);
    expect(missing.ok && missing.data).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    const result = resizeBox(original, "box_1", { w: 100, d: 50, h: 90 });
    expect(result.ok && result.data.spaces[0]?.boxes[0]?.w).toBe(100);
  });
});
