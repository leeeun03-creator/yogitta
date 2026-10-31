import { describe, expect, it } from "vitest";
import { elevationMessage } from "./elevationMessage";

describe("elevationMessage", () => {
  it("까닭마다 고칠 방법을 알 수 있게 말한다", () => {
    expect(elevationMessage("notNumber")).toBe("설치 높이는 숫자로 써 주세요");
    expect(elevationMessage("tooLow")).toBe("설치 높이는 0cm보다 낮게 할 수 없어요");
    expect(elevationMessage("tooHigh")).toBe("설치 높이와 가구 높이를 더해 240cm까지예요");
    expect(elevationMessage("blocked")).toBe(
      "아래나 위 가구와 높이가 겹쳐서 이 높이로 바꿀 수 없어요",
    );
  });
});
