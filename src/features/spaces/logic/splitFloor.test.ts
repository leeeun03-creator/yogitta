import { describe, expect, it } from "vitest";
import type { Point } from "@/shared/types";
import type { FloorLine } from "./blockFloorCells";
import { partAt } from "./partAt";
import { splitFloor } from "./splitFloor";

const FLOOR = { w: 600, h: 450 };
const line = (...points: [number, number][]): FloorLine => ({
  points: points.map(([x, y]) => ({ x, y })),
});
const at = (x: number, y: number): Point => ({ x, y });

/** 두 점이 서로 다른 구획에 있는지 (둘 다 구획 안이어야 한다). */
function isSplit(lines: FloorLine[], a: Point, b: Point, floor = FLOOR) {
  const parts = splitFloor(floor, lines);
  const partA = partAt(parts, a);
  const partB = partAt(parts, b);
  expect(partA).not.toBeNull();
  expect(partB).not.toBeNull();
  return partA !== partB;
}

describe("splitFloor", () => {
  it("벽이 없으면 바닥 전체가 구획 1개다", () => {
    const parts = splitFloor(FLOOR, []);
    expect(parts.count).toBe(1);
    expect([parts.cols, parts.rows]).toEqual([60, 45]);
    expect(partAt(parts, at(0, 0))).toBe(0);
    expect(partAt(parts, at(599, 449))).toBe(0);
  });

  it("바닥을 가로지르는 가운데 벽이 있으면 구획 2개다", () => {
    const parts = splitFloor(FLOOR, [line([300, 0], [300, 450])]);
    expect(parts.count).toBe(2);
    expect(isSplit([line([300, 0], [300, 450])], at(100, 100), at(500, 100))).toBe(true);
  });

  it("닫힌 사각형 벽은 안과 밖을 나눈다 (마지막 → 첫 점 선분도 막는다)", () => {
    const rect: FloorLine = {
      ...line([100, 100], [500, 100], [500, 350], [100, 350]),
      closed: true,
    };
    expect(splitFloor(FLOOR, [rect]).count).toBe(2);
    expect(isSplit([rect], at(300, 200), at(50, 50))).toBe(true);
    // 닫히지 않은 같은 점 목록은 왼쪽이 열려 있어 나누지 않는다
    expect(splitFloor(FLOOR, [{ ...rect, closed: false }]).count).toBe(1);
  });

  it("벽과 구역 선을 함께 경계로 쓴다 (벽에서 벽으로 이은 구역 선)", () => {
    const walls = [line([300, 0], [300, 450])];
    const roomLine = line([300, 200], [600, 200]);
    const parts = splitFloor(FLOOR, [...walls, roomLine]);
    expect(parts.count).toBe(3);
    expect(isSplit([...walls, roomLine], at(450, 100), at(450, 300))).toBe(true);
  });

  it("엣지: 대각선 선도 격자 모서리 사이로 새지 않는다", () => {
    expect(isSplit([line([0, 0], [600, 450])], at(500, 50), at(50, 400))).toBe(true);
    expect(isSplit([line([0, 450], [450, 0])], at(50, 50), at(500, 400))).toBe(true);
    expect(isSplit([line([0, 13], [600, 437])], at(500, 50), at(50, 400))).toBe(true);
  });

  it("엣지: 곡선(점이 많은 선)도 틈 없이 나눈다", () => {
    const arc = Array.from({ length: 31 }, (_, index): [number, number] => {
      const angle = (index / 30) * (Math.PI / 2);
      return [250 * Math.cos(angle), 250 * Math.sin(angle)];
    });
    expect(isSplit([line(...arc)], at(30, 30), at(500, 400))).toBe(true);
  });

  it("엣지: 끝이 벽에 닿지 않은 선은 나누지 않는다", () => {
    expect(splitFloor(FLOOR, [line([100, 225], [500, 225])]).count).toBe(1);
    // 문 자리를 비운 벽도 양쪽이 이어진다
    expect(
      splitFloor(FLOOR, [line([300, 0], [300, 200]), line([300, 290], [300, 450])]).count,
    ).toBe(1);
  });

  it("엣지: 바닥 테두리 위 선은 구획을 늘리지 않는다", () => {
    const edges = [line([0, 0], [600, 0]), line([600, 0], [600, 450]), line([0, 450], [600, 450])];
    expect(splitFloor(FLOOR, edges).count).toBe(1);
  });

  it("엣지: 바닥 밖으로 나간 선은 바닥 안 부분만 막는다", () => {
    expect(isSplit([line([300, -100], [300, 600])], at(100, 100), at(500, 100))).toBe(true);
  });

  it("엣지: 10cm로 나눠떨어지지 않는 바닥도 끝까지 격자로 덮는다", () => {
    const parts = splitFloor({ w: 605, h: 452 }, []);
    expect([parts.cols, parts.rows]).toEqual([61, 46]);
    expect(partAt(parts, at(604, 451))).toBe(0);
  });

  it("엣지: 30 × 30 m 바닥(9만 격자)도 빨리 나눈다", () => {
    const floor = { w: 3000, h: 3000 };
    const start = performance.now();
    const parts = splitFloor(floor, [line([1500, 0], [1500, 3000]), line([0, 1500], [3000, 1500])]);
    expect(performance.now() - start).toBeLessThan(500);
    expect(parts.count).toBe(4);
  });

  it("엣지: 원본 선을 바꾸지 않는다", () => {
    const lines = Object.freeze([Object.freeze(line([300, 0], [300, 450]))]);
    expect(() => splitFloor(Object.freeze({ ...FLOOR }), [...lines])).not.toThrow();
  });
});

describe("partAt", () => {
  const parts = splitFloor(FLOOR, [line([300, 0], [300, 450])]);

  it("엣지: 벽·구역 선이 지나는 격자 위 점은 구획이 없다", () => {
    expect(partAt(parts, at(300, 200))).toBeNull();
  });

  it("엣지: 바닥 밖 점은 구획이 없다", () => {
    for (const point of [at(-1, 50), at(50, -1), at(600, 50), at(50, 450), at(9999, 9999)]) {
      expect(partAt(parts, point)).toBeNull();
    }
  });

  it("같은 구획 안 두 점은 같은 번호다", () => {
    expect(partAt(parts, at(10, 10))).toBe(partAt(parts, at(290, 440)));
  });
});
