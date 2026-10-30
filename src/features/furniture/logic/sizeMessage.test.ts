import { describe, expect, it } from "vitest";
import { sizeMessage } from "./sizeMessage";

describe("sizeMessage", () => {
  it("크기를 못 바꾼 까닭마다 안내 문구가 있다", () => {
    expect(sizeMessage("notNumber")).toBe("크기는 숫자로 써 주세요");
    expect(sizeMessage("tooSmall")).toBe("10cm보다 작게 할 수 없어요");
    expect(sizeMessage("tooTall")).toBe("높이는 240cm까지예요");
    expect(sizeMessage("tooLong")).toBe("바닥보다 길어서 이 크기로 바꿀 수 없어요");
    expect(sizeMessage("blocked")).toBe("벽이나 다른 가구와 겹쳐서 이 크기로 바꿀 수 없어요");
  });
});
