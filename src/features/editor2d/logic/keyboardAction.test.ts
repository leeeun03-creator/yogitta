import { describe, expect, it } from "vitest";
import { KEYBOARD_PAN_PX, ZOOM_STEP } from "@/shared/constants/floorPlan";
import { keyboardAction } from "./keyboardAction";

describe("keyboardAction", () => {
  it("+ 와 = 는 확대, - 는 축소", () => {
    expect(keyboardAction("+")).toEqual({ type: "zoom", factor: ZOOM_STEP });
    expect(keyboardAction("=")).toEqual({ type: "zoom", factor: ZOOM_STEP });
    expect(keyboardAction("-")).toEqual({ type: "zoom", factor: 1 / ZOOM_STEP });
  });

  it("0 은 처음 보기", () => {
    expect(keyboardAction("0")).toEqual({ type: "reset" });
  });

  it("오른쪽 방향키는 오른쪽을 더 보도록 바닥을 왼쪽으로 옮긴다", () => {
    expect(keyboardAction("ArrowRight")).toEqual({
      type: "pan",
      delta: { x: -KEYBOARD_PAN_PX, y: 0 },
    });
    expect(keyboardAction("ArrowUp")).toEqual({ type: "pan", delta: { x: 0, y: KEYBOARD_PAN_PX } });
  });

  it("관계없는 키는 무시한다", () => {
    for (const key of ["a", "Enter", "Tab", " "]) expect(keyboardAction(key)).toBeNull();
  });
});
