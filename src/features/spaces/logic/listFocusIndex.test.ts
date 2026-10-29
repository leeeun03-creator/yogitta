import { describe, expect, it } from "vitest";
import { listFocusIndex } from "./listFocusIndex";

describe("listFocusIndex", () => {
  it("↓는 다음 줄, ↑는 앞 줄", () => {
    expect(listFocusIndex(0, 3, "ArrowDown")).toBe(1);
    expect(listFocusIndex(2, 3, "ArrowUp")).toBe(1);
  });

  it("엣지: 끝에서 ↓는 처음으로, 처음에서 ↑는 마지막으로 돈다", () => {
    expect(listFocusIndex(2, 3, "ArrowDown")).toBe(0);
    expect(listFocusIndex(0, 3, "ArrowUp")).toBe(2);
  });

  it("Home·End는 처음·마지막", () => {
    expect(listFocusIndex(1, 3, "Home")).toBe(0);
    expect(listFocusIndex(1, 3, "End")).toBe(2);
  });

  it("엣지: 다른 키·빈 목록은 null, 한 줄이면 그 자리", () => {
    expect(listFocusIndex(0, 3, "Enter")).toBeNull();
    expect(listFocusIndex(0, 0, "ArrowDown")).toBeNull();
    expect(listFocusIndex(0, 1, "ArrowDown")).toBe(0);
  });

  it("엣지: 지금 줄을 모르면(-1) ↓는 처음, ↑는 마지막", () => {
    expect(listFocusIndex(-1, 3, "ArrowDown")).toBe(0);
    expect(listFocusIndex(-1, 3, "ArrowUp")).toBe(2);
  });
});
