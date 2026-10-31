import { describe, expect, it } from "vitest";
import { isStackedOn } from "./isStackedOn";
import { STACK_DESK, stackBox } from "./stackFixtures";

describe("isStackedOn", () => {
  const top = stackBox("top", { parentId: "desk" });
  const topmost = stackBox("topmost", { parentId: "top" });
  const boxes = [STACK_DESK, top, topmost, stackBox("floor")];

  it("바로 위에 올린 가구와 다른 가구 위 가구를 거친 가구 모두 그 가구 위다", () => {
    expect(isStackedOn(boxes, "top", "desk")).toBe(true);
    expect(isStackedOn(boxes, "topmost", "desk")).toBe(true);
  });

  it("받침 가구는 자기 위 가구 위가 아니고, 바닥 가구는 아무 가구 위도 아니다", () => {
    expect(isStackedOn(boxes, "desk", "top")).toBe(false);
    expect(isStackedOn(boxes, "floor", "desk")).toBe(false);
    expect(isStackedOn(boxes, "desk", "desk")).toBe(false);
  });

  it("엣지: 깨진 데이터(받침 가구가 서로를 가리킴, 없는 가구)에서도 멈춘다", () => {
    const loop = [stackBox("a", { parentId: "b" }), stackBox("b", { parentId: "a" })];
    expect(isStackedOn(loop, "a", "c")).toBe(false);
    expect(isStackedOn([stackBox("a", { parentId: "gone" })], "a", "desk")).toBe(false);
  });
});
