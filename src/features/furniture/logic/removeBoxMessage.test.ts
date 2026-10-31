import { describe, expect, it } from "vitest";
import { removeBoxMessage } from "./removeBoxMessage";

describe("removeBoxMessage", () => {
  it("물건만 들었으면 지금 문구 그대로다 (옮길 가구가 있을 때·없을 때)", () => {
    expect(removeBoxMessage({ itemCount: 2, stackedCount: 0, canMove: true })).toBe(
      "물건 2개가 들어 있어요. 다른 가구의 칸 없음으로 옮기거나 같이 지울 수 있어요",
    );
    expect(removeBoxMessage({ itemCount: 1, stackedCount: 0, canMove: false })).toBe(
      "물건 1개가 들어 있어요. 가구를 지우면 물건도 같이 지워져요",
    );
  });

  it("위에 올린 가구가 있으면 그 수를 앞에 붙이고, 물건이 없으면 내리거나 지울 수 있다고 한다", () => {
    expect(removeBoxMessage({ itemCount: 0, stackedCount: 2, canMove: true })).toBe(
      "위에 올려 둔 가구가 2개 있어요. 바닥으로 내리거나 같이 지울 수 있어요",
    );
    expect(removeBoxMessage({ itemCount: 3, stackedCount: 1, canMove: true })).toBe(
      "위에 올려 둔 가구가 1개 있어요. 물건 3개가 들어 있어요. 다른 가구의 칸 없음으로 옮기거나 같이 지울 수 있어요",
    );
  });
});
