import { describe, expect, it } from "vitest";
import { formatMeters } from "./formatMeters";

describe("formatMeters", () => {
  it.each([
    [600, "6.0"],
    [450, "4.5"],
    [1200, "12.0"],
    [100, "1.0"],
    [455, "4.55"],
    [3000, "30.0"],
  ])("%icm → %s", (cm, text) => {
    expect(formatMeters(cm)).toBe(text);
  });
});
