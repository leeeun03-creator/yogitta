import { describe, expect, it } from "vitest";
import { DEFAULT_FLOOR, FLOOR_MAX_CM, FLOOR_MIN_CM, FLOOR_PRESETS } from "./floor";

describe("바닥 크기 상수", () => {
  it("빠른 선택은 모두 입력 범위 안에 있다", () => {
    for (const { floor } of FLOOR_PRESETS) {
      for (const side of [floor.w, floor.h]) {
        expect(side).toBeGreaterThanOrEqual(FLOOR_MIN_CM);
        expect(side).toBeLessThanOrEqual(FLOOR_MAX_CM);
      }
    }
  });

  it("기본값은 빠른 선택 중 하나다 (첫 실행 화면에서 선택된 칩으로 보이게)", () => {
    expect(FLOOR_PRESETS.map((preset) => preset.floor)).toContainEqual(DEFAULT_FLOOR);
  });
});
