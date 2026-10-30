import { describe, expect, it } from "vitest";
import { metersMessage } from "./metersMessage";

describe("metersMessage", () => {
  it("바닥 크기 칸이 틀린 까닭마다 안내 문구가 있다", () => {
    expect(metersMessage("empty")).toBe("크기를 적어 주세요");
    expect(metersMessage("notNumber")).toBe("숫자로 적어 주세요 (예: 6.0)");
    expect(metersMessage("tooSmall")).toBe("1m 이상으로 적어 주세요");
    expect(metersMessage("tooLarge")).toBe("30m 이하로 적어 주세요");
  });
});
