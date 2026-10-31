import { describe, expect, it } from "vitest";
import type { UiState } from "../uiState";
import { createBoxTestData } from "./boxFixtures";
import { keepSelection } from "./keepSelection";

const UI: UiState = {
  mode: "edit",
  view: "plan",
  tool: "select",
  snap: true,
  roomFocus: null,
  selectedBoxId: "box_1",
  removeAsk: null,
  searchQuery: "",
  foundItemId: null,
};

describe("keepSelection", () => {
  it("고른 가구가 현재 공간에 있으면 원본 그대로다", () => {
    expect(keepSelection(UI, createBoxTestData([{}]))).toBe(UI);
  });

  it("엣지: 고른 가구가 없어졌으면(지움·되돌리기) 고른 가구를 비운다", () => {
    expect(keepSelection(UI, createBoxTestData()).selectedBoxId).toBeNull();
  });

  it("엣지: 고른 가구가 없으면 원본 그대로다", () => {
    const none = { ...UI, selectedBoxId: null };
    expect(keepSelection(none, createBoxTestData())).toBe(none);
  });

  it("엣지: 삭제 확인을 연 가구가 없어졌으면 삭제 확인도 비운다", () => {
    const asking = { ...UI, removeAsk: "box_1" };
    expect(keepSelection(asking, createBoxTestData([{}]))).toBe(asking);
    expect(keepSelection(asking, createBoxTestData()).removeAsk).toBeNull();
  });

  it("엣지: 현재 공간이 없으면 고른 가구를 비운다", () => {
    const data = { ...createBoxTestData([{}]), currentSpaceId: null };
    expect(keepSelection(UI, data).selectedBoxId).toBeNull();
  });
});
