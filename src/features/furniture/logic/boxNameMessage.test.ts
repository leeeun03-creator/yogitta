import { describe, expect, it } from "vitest";
import { boxNameMessage } from "./boxNameMessage";

describe("boxNameMessage", () => {
  it("같은 이름이면 그 이름과 받침에 맞는 조사로 알린다", () => {
    expect(boxNameMessage("duplicateName", "화장대 서랍장")).toBe("이미 '화장대 서랍장'이 있어요");
    expect(boxNameMessage("duplicateName", " 침대 ")).toBe("이미 '침대'가 있어요");
    expect(boxNameMessage("duplicateName", "서랍장 1")).toBe("이미 '서랍장 1'이 있어요");
  });

  it("빈 이름·너무 긴 이름 안내", () => {
    expect(boxNameMessage("emptyName", "")).toBe("가구 이름을 써 주세요");
    expect(boxNameMessage("tooLong", "가".repeat(16))).toBe("가구 이름은 15자까지 쓸 수 있어요");
  });
});
