import { describe, expect, it } from "vitest";
import { parseMeters } from "./parseMeters";

describe("parseMeters", () => {
  it.each([
    ["6.0", 600],
    ["4.5", 450],
    ["12", 1200],
    ["4,5", 450],
    ["  6.0  ", 600],
    ["2.", 200],
    ["1", 100],
    ["30", 3000],
    ["4.55", 455],
  ])("%s → %icm", (text, cm) => {
    expect(parseMeters(text)).toEqual({ ok: true, cm });
  });

  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["abc", "notNumber"],
    ["6m", "notNumber"],
    ["1.2.3", "notNumber"],
    ["0", "tooSmall"],
    ["-3", "tooSmall"],
    ["0.99", "tooSmall"],
    [".5", "tooSmall"],
    ["30.01", "tooLarge"],
    ["999999", "tooLarge"],
  ])("'%s'는 거부한다 (%s)", (text, reason) => {
    expect(parseMeters(text)).toEqual({ ok: false, reason });
  });
});
