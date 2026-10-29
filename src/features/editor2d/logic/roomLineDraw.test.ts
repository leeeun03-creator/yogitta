import { describe, expect, it } from "vitest";
import type { Point } from "@/shared/types";
import { attachRoomLineEnds } from "./attachRoomLineEnds";
import { simplifyRoomLine } from "./simplifyRoomLine";

const FLOOR = { w: 600, h: 450 };
const at = (x: number, y: number): Point => ({ x, y });
/** a → b를 1cm마다 찍은 점 (끌기처럼). */
const dragPoints = (a: Point, b: Point) => {
  const steps = Math.round(Math.hypot(b.x - a.x, b.y - a.y));
  return Array.from({ length: steps + 1 }, (_, i) =>
    at(a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps),
  );
};

describe("simplifyRoomLine", () => {
  it("1cm마다 찍힌 점을 5cm 간격으로 줄이고 처음·끝 점은 남긴다", () => {
    const line = simplifyRoomLine(dragPoints(at(100, 100), at(200, 100)), FLOOR);
    expect(line?.[0]).toEqual(at(100, 100));
    expect(line?.[line.length - 1]).toEqual(at(200, 100));
    expect(line).toHaveLength(21);
  });

  it("손을 뗀 자리가 앞 점과 가까워도 끝점이 된다", () => {
    const line = simplifyRoomLine([at(0, 0), at(50, 0), at(52, 0)], FLOOR);
    expect(line).toEqual([at(0, 0), at(52, 0)]);
  });

  it("엣지: 20cm보다 짧은 선·점 하나·빈 목록은 null이다", () => {
    expect(simplifyRoomLine(dragPoints(at(100, 100), at(119, 100)), FLOOR)).toBeNull();
    expect(simplifyRoomLine([at(100, 100)], FLOOR)).toBeNull();
    expect(simplifyRoomLine([], FLOOR)).toBeNull();
    expect(simplifyRoomLine(dragPoints(at(100, 100), at(120, 100)), FLOOR)).not.toBeNull();
  });

  it("엣지: 제자리에서 흔든 선(멀리 가지 않음)도 길이가 짧으면 null이다", () => {
    expect(
      simplifyRoomLine([at(100, 100), at(103, 101), at(99, 98), at(101, 100)], FLOOR),
    ).toBeNull();
  });

  it("엣지: 바닥 밖으로 끈 점은 바닥 경계로 당긴다", () => {
    const line = simplifyRoomLine([at(300, -50), at(300, 200), at(300, 600)], FLOOR);
    expect(line).toEqual([at(300, 0), at(300, 200), at(300, 450)]);
  });

  it("엣지: 0.1cm까지만 남긴다", () => {
    expect(simplifyRoomLine([at(10.123, 10.456), at(90.987, 10)], FLOOR)).toEqual([
      at(10.1, 10.5),
      at(91, 10),
    ]);
  });

  it("엣지: 원본 점을 바꾸지 않는다", () => {
    const raw = Object.freeze([Object.freeze(at(0, 0)), Object.freeze(at(100, 0))]);
    expect(() => simplifyRoomLine(raw, FLOOR)).not.toThrow();
  });
});

describe("attachRoomLineEnds", () => {
  const wall = { id: "wall_1", points: [at(300, 0), at(300, 450)] };

  it("끝이 벽에서 30cm 안이면 벽 위로 옮긴다", () => {
    const line = attachRoomLineEnds([at(280, 200), at(450, 210), at(580, 220)], FLOOR, [wall], 30);
    expect(line).toEqual([at(300, 200), at(450, 210), at(600, 220)]); // 끝은 바닥 테두리로
  });

  it("엣지: 30cm 밖이면 그대로 둔다", () => {
    const points = [at(260, 200), at(450, 200), at(560, 200)];
    expect(attachRoomLineEnds(points, FLOOR, [wall], 30)).toEqual(points);
  });

  it("엣지: 경계가 여럿이면 가장 가까운 곳으로 (벽 vs 바닥 테두리)", () => {
    const line = attachRoomLineEnds(
      [at(20, 200), at(200, 200)],
      FLOOR,
      [{ id: "wall_2", points: [at(10, 0), at(10, 450)] }],
      30,
    );
    expect(line[0]).toEqual(at(10, 200));
  });

  it("엣지: 닫힌 벽은 마지막 → 첫 점 선분에도 붙는다", () => {
    const rect = {
      id: "wall_3",
      points: [at(100, 100), at(500, 100), at(500, 350), at(100, 350)],
      closed: true,
    };
    const line = attachRoomLineEnds([at(110, 200), at(300, 200)], FLOOR, [rect], 30);
    expect(line[0]).toEqual(at(100, 200));
  });

  it("다른 구역 선에도 붙는다", () => {
    const other = { id: "roomLine_1", points: [at(0, 300), at(600, 300)] };
    const line = attachRoomLineEnds([at(200, 100), at(200, 290)], FLOOR, [other], 30);
    expect(line).toEqual([at(200, 100), at(200, 300)]);
  });
});
