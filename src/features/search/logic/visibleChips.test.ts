import { describe, expect, it } from "vitest";
import { visibleChips } from "./visibleChips";

describe("visibleChips", () => {
  it("4개까지 보이고 나머지는 외 n개로 묶는다 (4개면 묶지 않는다)", () => {
    expect(visibleChips([1, 2, 3, 4, 5, 6, 7], false)).toEqual({
      shown: [1, 2, 3, 4],
      restCount: 3,
    });
    expect(visibleChips([1, 2, 3, 4], false)).toEqual({ shown: [1, 2, 3, 4], restCount: 0 });
  });

  it("펼치면 모두 보인다", () => {
    expect(visibleChips([1, 2, 3, 4, 5, 6, 7], true)).toEqual({
      shown: [1, 2, 3, 4, 5, 6, 7],
      restCount: 0,
    });
  });
});
