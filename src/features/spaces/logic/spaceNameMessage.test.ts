import { describe, expect, it } from "vitest";
import { spaceNameMessage } from "./spaceNameMessage";

describe("spaceNameMessage", () => {
  it("빈 이름·같은 이름마다 안내 문구가 있다", () => {
    expect(spaceNameMessage("emptyName")).toBe("공간 이름을 적어 주세요");
    expect(spaceNameMessage("duplicateName")).toBe("이미 같은 이름의 공간이 있어요");
  });
});
