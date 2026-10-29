import { describe, expect, it } from "vitest";
import { boxFaceColors } from "./boxFaceColors";

describe("boxFaceColors", () => {
  it("+x, -x, +y, -y, +z, -z 순서로 옆면·윗면·앞면 밝기를 준다", () => {
    expect(boxFaceColors("#F6EAD8")).toEqual([
      "#B6ADA0", // +x 끝면 0.74
      "#B6ADA0", // -x 끝면
      "#F6EAD8", // +y 윗면 1
      "#B6ADA0", // -y 아랫면 (보이지 않음)
      "#D4C9BA", // +z 긴 면 0.86
      "#D4C9BA", // -z 긴 면
    ]);
  });

  it("윗면이 가장 밝고 옆면이 가장 어둡다", () => {
    const [side = "", , top = "", , front = ""] = boxFaceColors("#A6754D");
    const brightness = (hex: string) => parseInt(hex.slice(1), 16);
    expect(brightness(top)).toBeGreaterThan(brightness(front));
    expect(brightness(front)).toBeGreaterThan(brightness(side));
  });
});
