import { describe, expect, it } from "vitest";
import type { Point, Wall } from "@/shared/types";
import { isBoxBlocked } from "./isBoxBlocked";
import { rectCorners } from "./rectCorners";
import { resolveBoxMove } from "./resolveBoxMove";
import { wallQuads } from "./wallQuads";

const at = (x: number, y: number): Point => ({ x, y });
const line = (a: Point, b: Point): Wall => ({
  id: "wall",
  tool: "line",
  points: [a, b],
  closed: false,
});
const SIZE = { w: 100, d: 100 };
const MIDDLE_WALL = wallQuads([line(at(300, 0), at(300, 450))]); // 벽 면: x 294 · 306

describe("resolveBoxMove", () => {
  it("막는 것이 없으면 옮기려는 자리 그대로다", () => {
    const input = { from: at(150, 150), to: at(200, 220), size: SIZE, obstacles: [] };
    expect(resolveBoxMove(input)).toEqual(at(200, 220));
  });

  it("벽 쪽으로 끌면 벽 면에 딱 붙어 멈춘다 (벽 너머 빈자리로 건너뛰지 않는다)", () => {
    const input = { from: at(150, 150), to: at(450, 150), size: SIZE, obstacles: MIDDLE_WALL };
    expect(resolveBoxMove(input)).toEqual(at(244, 150)); // 오른쪽 면 294
  });

  it("엣지: 비스듬히 끌면 막힌 축은 맞닿고 다른 축은 미끄러진다", () => {
    const input = { from: at(150, 150), to: at(450, 300), size: SIZE, obstacles: MIDDLE_WALL };
    expect(resolveBoxMove(input)).toEqual(at(244, 300));
  });

  it("엣지: 벽에 맞닿은 채로 벽을 따라 미끄러진다", () => {
    const input = { from: at(244, 150), to: at(260, 320), size: SIZE, obstacles: MIDDLE_WALL };
    expect(resolveBoxMove(input)).toEqual(at(244, 320));
  });

  it("엣지: 다른 가구에도 면이 딱 붙어 멈춘다", () => {
    const other = [rectCorners(at(400, 150), SIZE)]; // 350 ~ 450
    const input = { from: at(150, 150), to: at(380, 150), size: SIZE, obstacles: other };
    expect(resolveBoxMove(input)).toEqual(at(300, 150));
  });

  it("엣지: 벽 끝(각진 끝 아래)을 돌아 반대쪽으로 갈 수 있다", () => {
    const shortWall = wallQuads([line(at(300, 0), at(300, 200))]); // 아래 끝 206
    const input = { from: at(150, 150), to: at(450, 400), size: SIZE, obstacles: shortWall };
    expect(resolveBoxMove(input)).toEqual(at(450, 400)); // 먼저 내려가고 옆으로
  });

  it("엣지: 좁은 틈(98cm)에는 가로 90cm는 들어가고 100cm는 못 들어간다", () => {
    const gap = wallQuads([line(at(300, 0), at(300, 450)), line(at(410, 0), at(410, 450))]);
    const fits = { from: at(355, 600), to: at(355, 200), size: { w: 90, d: 90 }, obstacles: gap };
    expect(resolveBoxMove(fits)).toEqual(at(355, 200));
    const stuck = { ...fits, size: SIZE };
    expect(resolveBoxMove(stuck)).toEqual(at(355, 506)); // 벽 끝 456 + 반 50
  });

  it("엣지: 비스듬한 벽에도 맞닿는 자리에서 멈춘다", () => {
    const diagonal = wallQuads([line(at(0, 0), at(400, 400))]);
    const size = { w: 40, d: 40 };
    const result = resolveBoxMove({
      from: at(300, 100),
      to: at(100, 100),
      size,
      obstacles: diagonal,
    });
    expect(result.x).toBeGreaterThan(100);
    expect(isBoxBlocked(result, size, diagonal)).toBe(false);
    expect(isBoxBlocked(at(result.x - 0.5, result.y), size, diagonal)).toBe(true);
  });

  it("엣지: 이미 겹쳐 있는 가구(가져온 백업 파일 등)는 막지 않아 빼낼 수 있다", () => {
    const input = { from: at(300, 150), to: at(150, 150), size: SIZE, obstacles: MIDDLE_WALL };
    expect(resolveBoxMove(input)).toEqual(at(150, 150));
  });

  it("엣지: 90도 돌린 가구는 돌린 크기(가로 40·깊이 200)로 막힌다", () => {
    const input = {
      from: at(150, 200),
      to: at(450, 200),
      size: { w: 40, d: 200 },
      obstacles: MIDDLE_WALL,
    };
    expect(resolveBoxMove(input)).toEqual(at(274, 200));
  });

  it("엣지: 가구 50개 사이에서도 막는 것만 막는다", () => {
    const far = Array.from({ length: 50 }, (_, i) => rectCorners(at(1000 + i * 10, 1000), SIZE));
    const input = {
      from: at(150, 150),
      to: at(450, 150),
      size: SIZE,
      obstacles: [...far, ...MIDDLE_WALL],
    };
    expect(resolveBoxMove(input)).toEqual(at(244, 150));
  });
});
