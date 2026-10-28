import { describe, expect, it } from "vitest";
import { validateNewSpace } from "./validateNewSpace";

const VALID = { name: "내 방", width: "6.0", depth: "4.5" };

describe("validateNewSpace", () => {
  it("올바른 입력이면 이름과 바닥 크기(cm)를 돌려준다", () => {
    expect(validateNewSpace({ ...VALID, name: " 내 방 " }, [])).toEqual({
      ok: true,
      name: "내 방",
      floor: { w: 600, h: 450 },
    });
  });

  it("빈 이름을 막는다", () => {
    expect(validateNewSpace({ ...VALID, name: "  " }, [])).toEqual({
      ok: false,
      errors: { name: "empty" },
    });
  });

  it("이미 있는 공간 이름을 막는다 (앞뒤 공백 무시)", () => {
    expect(validateNewSpace({ ...VALID, name: "형 방" }, [" 형 방 "])).toEqual({
      ok: false,
      errors: { name: "duplicate" },
    });
  });

  it("틀린 칸을 모두 한 번에 알려준다", () => {
    expect(validateNewSpace({ name: "", width: "0", depth: "abc" }, [])).toEqual({
      ok: false,
      errors: { name: "empty", width: "tooSmall", depth: "notNumber" },
    });
  });
});
