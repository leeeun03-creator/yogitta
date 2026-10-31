import { describe, expect, it } from "vitest";
import { rowHeightMessage } from "./rowHeightMessage";

describe("rowHeightMessage", () => {
  it("까닭마다 고칠 방법을 알 수 있게 말한다 (넘으면 전체 높이를 넣는다)", () => {
    expect(rowHeightMessage("notNumber", 90)).toBe("칸 높이는 숫자로 써 주세요");
    expect(rowHeightMessage("tooSmall", 90)).toBe("칸 높이는 10cm보다 작게 할 수 없어요");
    expect(rowHeightMessage("overHeight", 90)).toBe(
      "칸 높이 합계가 전체 높이 90cm를 넘어요. 다른 칸을 먼저 줄여 주세요",
    );
  });
});
