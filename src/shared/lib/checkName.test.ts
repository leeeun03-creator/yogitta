import { describe, expect, it } from "vitest";
import { checkName } from "./checkName";

describe("checkName", () => {
  it("앞뒤 공백을 지운 이름을 돌려준다", () => {
    expect(checkName(["서랍장 1"], "  화장대 서랍장 ", 15)).toEqual({
      ok: true,
      name: "화장대 서랍장",
    });
  });

  it("엣지: 빈 이름·공백만은 막는다", () => {
    expect(checkName([], "", 15)).toEqual({ ok: false, reason: "emptyName" });
    expect(checkName([], " \t ", 15)).toEqual({ ok: false, reason: "emptyName" });
  });

  it("엣지: 다른 이름과 띄어쓰기·대소문자만 달라도 같은 이름이다", () => {
    for (const name of ["서랍장 1", "서랍장1", " 서 랍 장 1 ", "SOFA", "So Fa"]) {
      expect(checkName(["서랍장 1", "sofa"], name, 15), name).toEqual({
        ok: false,
        reason: "duplicateName",
      });
    }
  });

  it("엣지: 최대 글자 수까지는 되고 한 글자라도 넘으면 막는다 (이모지는 한 글자)", () => {
    expect(checkName([], "가".repeat(15), 15).ok).toBe(true);
    expect(checkName([], "가".repeat(16), 15)).toEqual({ ok: false, reason: "tooLong" });
    expect(checkName([], "📦".repeat(15), 15).ok).toBe(true);
  });
});
