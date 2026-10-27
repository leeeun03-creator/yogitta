import { describe, expect, it } from "vitest";
import { createId } from "./createId";

describe("createId", () => {
  it("접두사를 붙인다", () => {
    expect(createId("box").startsWith("box_")).toBe(true);
  });

  it("부를 때마다 다른 id를 만든다", () => {
    expect(createId("item")).not.toBe(createId("item"));
  });
});
