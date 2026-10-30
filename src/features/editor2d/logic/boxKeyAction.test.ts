import { describe, expect, it } from "vitest";
import { boxKeyAction } from "./boxKeyAction";

const press = (key: string, code = "", modifiers: Partial<Record<string, boolean>> = {}) => ({
  key,
  code,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...modifiers,
});

describe("boxKeyAction", () => {
  it("방향키는 그 쪽으로 한 칸 옮기기 (2D y는 아래가 +)", () => {
    expect(boxKeyAction(press("ArrowLeft"))).toEqual({ type: "move", direction: { x: -1, y: 0 } });
    expect(boxKeyAction(press("ArrowRight"))).toEqual({ type: "move", direction: { x: 1, y: 0 } });
    expect(boxKeyAction(press("ArrowUp"))).toEqual({ type: "move", direction: { x: 0, y: -1 } });
    expect(boxKeyAction(press("ArrowDown"))).toEqual({ type: "move", direction: { x: 0, y: 1 } });
  });

  it("R은 돌리기, Delete·Backspace는 지우기, Esc는 풀기", () => {
    expect(boxKeyAction(press("r", "KeyR"))).toEqual({ type: "rotate" });
    expect(boxKeyAction(press("Delete", "Delete"))).toEqual({ type: "remove" });
    expect(boxKeyAction(press("Backspace", "Backspace"))).toEqual({ type: "remove" });
    expect(boxKeyAction(press("Escape", "Escape"))).toEqual({ type: "deselect" });
  });

  it("엣지: 한글 입력 중(key가 'ㄱ')이나 대문자(Shift)여도 R 자리면 돌리기", () => {
    expect(boxKeyAction(press("ㄱ", "KeyR"))).toEqual({ type: "rotate" });
    expect(boxKeyAction(press("R", "KeyR", { shiftKey: true }))).toEqual({ type: "rotate" });
  });

  it("엣지: Ctrl·Cmd·Alt를 같이 누르면(새로고침 등) 아무것도 하지 않는다", () => {
    expect(boxKeyAction(press("r", "KeyR", { ctrlKey: true }))).toBeNull();
    expect(boxKeyAction(press("r", "KeyR", { metaKey: true }))).toBeNull();
    expect(boxKeyAction(press("ArrowLeft", "ArrowLeft", { altKey: true }))).toBeNull();
  });

  it("엣지: 관계없는 키는 null", () => {
    expect(boxKeyAction(press("Enter", "Enter"))).toBeNull();
    expect(boxKeyAction(press("a", "KeyA"))).toBeNull();
  });
});
