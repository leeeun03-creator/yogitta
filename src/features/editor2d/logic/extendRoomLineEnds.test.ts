import { describe, expect, it } from "vitest";
import type { Point } from "@/shared/types";
import { extendRoomLineEnds } from "./extendRoomLineEnds";
import { rayHitSegment } from "./rayHitSegment";

const FLOOR = { w: 600, h: 450 };
const at = (x: number, y: number): Point => ({ x, y });
const near = (point: Point | undefined, expected: Point) => {
  expect(point?.x).toBeCloseTo(expected.x);
  expect(point?.y).toBeCloseTo(expected.y);
};

describe("rayHitSegment", () => {
  it("반직선이 선분과 만나는 거리를 돌려준다", () => {
    expect(rayHitSegment(at(0, 0), at(1, 0), at(10, -5), at(10, 5))).toBe(10);
  });

  it("엣지: 뒤쪽·선분 밖·평행이면 null이다", () => {
    expect(rayHitSegment(at(0, 0), at(-1, 0), at(10, -5), at(10, 5))).toBeNull();
    expect(rayHitSegment(at(0, 0), at(1, 0), at(10, 1), at(10, 5))).toBeNull();
    expect(rayHitSegment(at(0, 0), at(1, 0), at(0, 5), at(10, 5))).toBeNull();
  });
});

describe("extendRoomLineEnds", () => {
  it("두 끝이 떠 있으면 그어 가던 방향으로 늘려 바닥 테두리에 닿게 한다", () => {
    const line = extendRoomLineEnds([at(300, 100), at(300, 350)], FLOOR, []);
    expect(line).toEqual([at(300, 0), at(300, 100), at(300, 350), at(300, 450)]);
  });

  it("벽이 더 가까우면 벽까지만 늘린다", () => {
    const wall = { id: "wall_1", points: [at(0, 50), at(600, 50)] };
    const line = extendRoomLineEnds([at(300, 100), at(300, 350)], FLOOR, [wall]);
    expect(line[0]).toEqual(at(300, 50));
  });

  it("엣지: 한쪽만 떠 있으면 그쪽만 늘린다", () => {
    const line = extendRoomLineEnds([at(300, 0), at(300, 350)], FLOOR, []);
    expect(line).toEqual([at(300, 0), at(300, 350), at(300, 450)]);
  });

  it("엣지: 이미 두 끝이 닿아 있으면 그대로다", () => {
    const points = [at(300, 0), at(310, 200), at(300, 450)];
    expect(extendRoomLineEnds(points, FLOOR, [])).toEqual(points);
  });

  it("엣지: 비스듬한 끝은 비스듬히 늘린다", () => {
    const line = extendRoomLineEnds([at(200, 200), at(300, 300)], FLOOR, []);
    near(line[0], at(0, 0));
    near(line[line.length - 1], at(450, 450));
  });

  it("엣지: 방향은 끝에서 20cm 안쪽 점으로 정해 끝의 작은 흔들림을 덜 탄다", () => {
    // 끝 바로 앞에서 1cm 옆으로 흔들렸어도 거의 똑바로 늘어난다
    const line = extendRoomLineEnds([at(300, 100), at(300, 300), at(301, 302)], FLOOR, []);
    const end = line[line.length - 1];
    expect(end?.y).toBe(450);
    expect(Math.abs((end?.x ?? 0) - 300)).toBeLessThan(20);
  });

  it("엣지: 늘리는 길에 다른 구역 선이 있으면 거기서 멈춘다", () => {
    const other = { id: "roomLine_1", points: [at(0, 400), at(600, 400)] };
    const line = extendRoomLineEnds([at(300, 0), at(300, 300)], FLOOR, [other]);
    expect(line[line.length - 1]).toEqual(at(300, 400));
  });

  it("엣지: 두 끝이 가까운 고리는 늘리지 않고 닫는다", () => {
    const loop = [at(200, 200), at(400, 200), at(400, 300), at(200, 300), at(205, 215)];
    expect(extendRoomLineEnds(loop, FLOOR, [])).toEqual([...loop, at(200, 200)]);
  });

  it("엣지: 바닥 밖으로는 늘리지 않는다 (바닥 테두리에서 멈춘다)", () => {
    const line = extendRoomLineEnds([at(590, 10), at(595, 5)], FLOOR, []);
    for (const point of line) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(600);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(450);
    }
  });

  it("엣지: 원본 점을 바꾸지 않는다", () => {
    const raw = Object.freeze([Object.freeze(at(300, 100)), Object.freeze(at(300, 350))]);
    expect(() => extendRoomLineEnds(raw, FLOOR, [])).not.toThrow();
  });
});
