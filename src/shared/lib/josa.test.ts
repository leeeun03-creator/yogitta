import { describe, expect, it } from "vitest";
import { josa } from "./josa";

describe("josa", () => {
  it("받침이 있으면 은·이·을, 없으면 는·가·를", () => {
    expect(josa("형 방", "을/를")).toBe("을");
    expect(josa("서재", "을/를")).toBe("를");
    expect(josa("여권", "은/는")).toBe("은");
    expect(josa("양말", "이/가")).toBe("이");
    expect(josa("충전기", "은/는")).toBe("는");
  });

  it("엣지: 숫자로 끝나면 읽는 소리로 (1 일·3 삼 / 2 이·5 오)", () => {
    expect(josa("새 공간 1", "을/를")).toBe("을");
    expect(josa("새 공간 3", "을/를")).toBe("을");
    expect(josa("새 공간 2", "을/를")).toBe("를");
    expect(josa("새 공간 5", "을/를")).toBe("를");
  });

  it("엣지: 영어로 끝나면 l·m·n만 받침으로 본다", () => {
    expect(josa("Room", "을/를")).toBe("을");
    expect(josa("USB", "을/를")).toBe("를");
  });

  it("엣지: 끝 공백은 무시하고, 빈 낱말·이모지는 받침 없음", () => {
    expect(josa("형 방 ", "을/를")).toBe("을");
    expect(josa("", "은/는")).toBe("는");
    expect(josa("🏠", "은/는")).toBe("는");
  });
});
