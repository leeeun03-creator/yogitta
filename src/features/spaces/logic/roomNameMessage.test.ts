import { describe, expect, it } from "vitest";
import { roomNameMessage } from "./roomNameMessage";

describe("roomNameMessage", () => {
  it("빈 이름이면 이름을 쓰라고 안내한다", () => {
    expect(roomNameMessage("emptyName")).toBe("구역 이름을 써 주세요");
  });

  it("같은 이름이면 이미 있다고 안내한다", () => {
    expect(roomNameMessage("duplicateName")).toBe("이미 있는 구역 이름이에요");
  });

  it("너무 길면 최대 글자 수를 알려 준다", () => {
    expect(roomNameMessage("tooLong")).toBe("구역 이름은 10자까지 쓸 수 있어요");
  });
});
