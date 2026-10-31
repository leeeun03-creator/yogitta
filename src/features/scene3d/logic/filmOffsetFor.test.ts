import { describe, expect, it } from "vitest";
import { DEG_TO_RAD } from "@/shared/constants/units";
import { filmOffsetFor } from "./filmOffsetFor";

const SCREEN = { width: 850, height: 600 };
const FILM_GAUGE = 35; // three.js 기본값

/** three.js가 filmOffset으로 보이는 창 왼쪽 끝을 옮기는 양을 화면 px로 되돌린다 (그림이 움직이는 쪽은 반대). */
function imageShiftPx(offset: number, fovDeg = 30) {
  const aspect = SCREEN.width / SCREEN.height;
  const near = 1;
  const windowWidth = aspect * 2 * near * Math.tan((fovDeg * DEG_TO_RAD) / 2);
  const leftMove = (near * offset) / (FILM_GAUGE * Math.min(aspect, 1));
  return -(leftMove / windowWidth) * SCREEN.width;
}

describe("filmOffsetFor", () => {
  it("그림이 화면 오른쪽으로 shiftPx만큼 옮겨지는 값이다 (음수)", () => {
    const offset = filmOffsetFor(246, SCREEN, 30, FILM_GAUGE);
    expect(offset).toBeLessThan(0);
    expect(imageShiftPx(offset)).toBeCloseTo(246);
  });

  it("엣지: 옮기지 않거나 크기가 0이면 0", () => {
    expect(filmOffsetFor(0, SCREEN, 30, FILM_GAUGE)).toBe(0);
    expect(filmOffsetFor(100, { width: 0, height: 600 }, 30, FILM_GAUGE)).toBe(0);
  });

  it("엣지: 세로로 긴 화면(aspect < 1)에서도 같은 px만큼 옮긴다", () => {
    const tall = { width: 300, height: 600 };
    const offset = filmOffsetFor(50, tall, 30, FILM_GAUGE);
    const aspect = tall.width / tall.height;
    const windowWidth = aspect * 2 * Math.tan((30 * DEG_TO_RAD) / 2);
    const leftMove = offset / (FILM_GAUGE * aspect);
    expect((-leftMove / windowWidth) * tall.width).toBeCloseTo(50);
  });
});
