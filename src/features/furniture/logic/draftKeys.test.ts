import { describe, expect, it, vi } from "vitest";
import { draftKeys } from "./draftKeys";

describe("draftKeys", () => {
  it("Enter는 저장, Esc는 되돌리기, 다른 키는 아무것도 하지 않는다", () => {
    const save = vi.fn();
    const cancel = vi.fn();
    const handle = draftKeys(save, cancel);
    handle({ key: "Enter" });
    handle({ key: "Escape" });
    handle({ key: "a" });
    expect(save).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
