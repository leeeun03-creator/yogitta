import { describe, expect, it } from "vitest";
import type { UiState } from "../uiState";
import { switchMode } from "./switchMode";

const EDITING: UiState = {
  mode: "edit",
  view: "preview",
  tool: "eraser",
  snap: false,
  roomFocus: { type: "new", at: { x: 10, y: 20 } },
  selectedBoxId: "box_1",
  removeAsk: "box_1",
};

describe("switchMode", () => {
  it("모드를 바꾸고, 보기는 2D 평면도·도구는 선택으로 돌리고 구역 입력칸·고른 가구·삭제 확인을 비운다", () => {
    expect(switchMode(EDITING, "main")).toEqual({
      mode: "main",
      view: "plan",
      tool: "select",
      snap: false,
      roomFocus: null,
      selectedBoxId: null,
      removeAsk: null,
    });
  });

  it("편집 모드로 들어갈 때도 처음 상태로 시작한다", () => {
    const back = switchMode({ ...EDITING, mode: "main" }, "edit");
    expect(back).toMatchObject({ mode: "edit", view: "plan", tool: "select", roomFocus: null });
  });

  it("엣지: 격자 스냅은 사용자가 정한 대로 둔다", () => {
    expect(switchMode(EDITING, "main").snap).toBe(false);
    expect(switchMode({ ...EDITING, snap: true }, "edit").snap).toBe(true);
  });

  it("엣지: 같은 모드로 바꿔도 처음 상태가 되고, 원본을 바꾸지 않는다", () => {
    const frozen = Object.freeze({ ...EDITING });
    expect(switchMode(frozen, "edit")).toMatchObject({ mode: "edit", tool: "select" });
    expect(frozen.tool).toBe("eraser");
  });
});
