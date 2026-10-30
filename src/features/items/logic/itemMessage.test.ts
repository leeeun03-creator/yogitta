import { describe, expect, it } from "vitest";
import { itemMessage } from "./itemMessage";

describe("itemMessage", () => {
  it("물건을 못 넣은 까닭마다 안내 문구가 있다", () => {
    expect(itemMessage("emptyName")).toBe("물건 이름을 써 주세요");
    expect(itemMessage("tooLong")).toBe("물건 이름은 30자까지 쓸 수 있어요");
    expect(itemMessage("memoTooLong")).toBe("메모는 100자까지 쓸 수 있어요");
  });
});
