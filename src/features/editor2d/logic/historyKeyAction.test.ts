import { describe, expect, it } from "vitest";
import { historyKeyAction } from "./historyKeyAction";

const press = (
  code: string,
  keys: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean } = {},
) => ({
  code,
  ctrlKey: keys.ctrl ?? false,
  metaKey: keys.meta ?? false,
  shiftKey: keys.shift ?? false,
  altKey: keys.alt ?? false,
});

describe("historyKeyAction", () => {
  it("Ctrl+Z는 되돌리기, Mac의 Cmd+Z도 같다", () => {
    expect(historyKeyAction(press("KeyZ", { ctrl: true }))).toBe("undo");
    expect(historyKeyAction(press("KeyZ", { meta: true }))).toBe("undo");
  });

  it("Ctrl+Shift+Z와 Ctrl+Y는 다시하기", () => {
    expect(historyKeyAction(press("KeyZ", { ctrl: true, shift: true }))).toBe("redo");
    expect(historyKeyAction(press("KeyY", { ctrl: true }))).toBe("redo");
    expect(historyKeyAction(press("KeyZ", { meta: true, shift: true }))).toBe("redo");
  });

  it("엣지: Ctrl·Cmd 없이 Z, Alt가 섞인 조합, Ctrl+Shift+Y, 다른 키는 null", () => {
    expect(historyKeyAction(press("KeyZ"))).toBeNull();
    expect(historyKeyAction(press("KeyZ", { shift: true }))).toBeNull();
    expect(historyKeyAction(press("KeyZ", { ctrl: true, alt: true }))).toBeNull();
    expect(historyKeyAction(press("KeyY", { ctrl: true, shift: true }))).toBeNull();
    expect(historyKeyAction(press("KeyX", { ctrl: true }))).toBeNull();
  });
});
