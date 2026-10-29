import { describe, expect, it } from "vitest";
import type { Point } from "@/shared/types";
import type { FloorLine } from "./blockFloorCells";
import { unnamedPartFinder } from "./unnamedPartFinder";

const FLOOR = { w: 600, h: 450 };
const at = (x: number, y: number): Point => ({ x, y });
const MIDDLE: FloorLine[] = [{ points: [at(300, 0), at(300, 450)] }];

/** 사각형들 넓이 합 (cm²). */
const areaOf = (rects: { w: number; h: number }[] | null) =>
  (rects ?? []).reduce((sum, rect) => sum + rect.w * rect.h, 0);

describe("unnamedPartFinder", () => {
  it("점이 든 이름 없는 구획을 칠할 사각형들을 돌려준다 (선 반대쪽으로 넘지 않음)", () => {
    const find = unnamedPartFinder(FLOOR, MIDDLE, []);
    const left = find(at(100, 100));
    expect(areaOf(left)).toBe(300 * 450);
    expect(Math.max(...(left ?? []).map((rect) => rect.x + rect.w))).toBe(300);
  });

  it("구역인 구획은 null이고, 이름 없는 쪽만 찾는다", () => {
    const find = unnamedPartFinder(FLOOR, MIDDLE, ["안방"], { 안방: at(100, 100) });
    expect(find(at(200, 300))).toBeNull();
    expect(areaOf(find(at(500, 100)))).toBe(300 * 450);
  });

  it("엣지: 선 위·바닥 밖은 null이다", () => {
    const find = unnamedPartFinder(FLOOR, MIDDLE, []);
    expect(find(at(300, 200))).toBeNull();
    expect(find(at(-5, 100))).toBeNull();
    expect(find(at(100, 460))).toBeNull();
  });

  it("엣지: 같은 구획은 같은 배열을 돌려준다 (마우스를 움직여도 다시 그리지 않게)", () => {
    const find = unnamedPartFinder(FLOOR, MIDDLE, []);
    expect(find(at(100, 100))).toBe(find(at(250, 400)));
  });

  it("엣지: 선이 없으면 바닥 전체이고, 기준점 없는 구역은 무시한다", () => {
    const find = unnamedPartFinder(FLOOR, [], ["안방"], {});
    expect(areaOf(find(at(10, 10)))).toBe(600 * 450);
  });
});
