import { describe, expect, it } from "vitest";
import { nextBoxName } from "./nextBoxName";

describe("nextBoxName", () => {
  it("가구가 없으면 1번이다", () => {
    expect(nextBoxName([], "보관함")).toBe("보관함 1");
  });

  it("쓴 번호 다음 번호를 붙인다", () => {
    expect(nextBoxName(["보관함 1", "보관함 2"], "보관함")).toBe("보관함 3");
  });

  it("엣지: 지워서 빈 번호가 있으면 가장 작은 빈 번호를 채운다", () => {
    expect(nextBoxName(["보관함 1", "보관함 3"], "보관함")).toBe("보관함 2");
    expect(nextBoxName(["보관함 2"], "보관함")).toBe("보관함 1");
  });

  it("엣지: 번호가 아니거나 띄어쓰기가 다른 비슷한 이름은 셈하지 않는다", () => {
    const names = ["보관함", "보관함1", "보관함 1a", "작은 보관함 1", "서랍장 1"];
    expect(nextBoxName(names, "보관함")).toBe("보관함 1");
  });

  it("앞머리는 넘긴 가구 종류 이름이다", () => {
    expect(nextBoxName(["보관함 1"], "서랍장")).toBe("서랍장 1");
  });
});
