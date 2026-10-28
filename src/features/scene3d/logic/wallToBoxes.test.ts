import { describe, expect, it } from "vitest";
import { WALL_HEIGHT_CM, WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { Point, Wall } from "@/shared/types";
import { wallToBoxes, type WallBox } from "./wallToBoxes";

const wall = (points: Point[], closed = false): Wall => ({
  id: "wall-1",
  tool: closed ? "rect" : "polyline",
  points,
  closed,
});

/** 박스의 로컬 x축이 3D에서 가리키는 방향 (x, z). 선분 방향과 같아야 한다. */
const direction = (box: WallBox) => [Math.cos(box.rotationY), -Math.sin(box.rotationY)];

describe("wallToBoxes", () => {
  it("가로 선분은 가운데·길이가 맞고 회전하지 않는다", () => {
    const [box] = wallToBoxes(
      wall([
        { x: 100, y: 50 },
        { x: 400, y: 50 },
      ]),
    );
    expect(box).toMatchObject({ key: "wall-1:0", x: 250, z: 50, length: 300 });
    expect(box?.rotationY).toBeCloseTo(0);
  });

  it("2D y는 3D z가 된다", () => {
    const [box] = wallToBoxes(
      wall([
        { x: 0, y: 200 },
        { x: 0, y: 400 },
      ]),
    );
    expect(box?.x).toBe(0);
    expect(box?.z).toBe(300);
  });

  it("높이 110cm, 두께 12cm다", () => {
    const [box] = wallToBoxes(
      wall([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    );
    expect(box?.height).toBe(WALL_HEIGHT_CM);
    expect(box?.thickness).toBe(WALL_THICKNESS_CM);
  });

  it("대각선 선분은 길이가 빗변이고 방향이 선분을 따른다", () => {
    const [box] = wallToBoxes(
      wall([
        { x: 0, y: 0 },
        { x: 300, y: 400 },
      ]),
    );
    expect(box).toMatchObject({ x: 150, z: 200, length: 500 });
    const [dx = NaN, dz = NaN] = box ? direction(box) : [];
    expect(dx).toBeCloseTo(0.6);
    expect(dz).toBeCloseTo(0.8);
  });

  it("엣지: 0·90·180·270도 (거꾸로 그린 선분) 모두 선분 방향을 따른다", () => {
    const cases: [Point, number[]][] = [
      [{ x: 100, y: 0 }, [1, 0]],
      [{ x: 0, y: 100 }, [0, 1]],
      [{ x: -100, y: 0 }, [-1, 0]],
      [{ x: 0, y: -100 }, [0, -1]],
    ];
    for (const [to, [ex = NaN, ez = NaN]] of cases) {
      const [box] = wallToBoxes(wall([{ x: 0, y: 0 }, to]));
      const [dx = NaN, dz = NaN] = box ? direction(box) : [];
      expect(dx).toBeCloseTo(ex);
      expect(dz).toBeCloseTo(ez);
      expect(box?.length).toBe(100);
    }
  });

  it("사각형(닫힌 벽)은 마지막 점 → 첫 점까지 박스 4개가 된다", () => {
    const boxes = wallToBoxes(
      wall(
        [
          { x: 0, y: 0 },
          { x: 600, y: 0 },
          { x: 600, y: 450 },
          { x: 0, y: 450 },
        ],
        true,
      ),
    );
    expect(boxes.map(({ x, z, length }) => [x, z, length])).toEqual([
      [300, 0, 600],
      [600, 225, 450],
      [300, 450, 600],
      [0, 225, 450],
    ]);
    expect(boxes.map((box) => box.key)).toEqual(["wall-1:0", "wall-1:1", "wall-1:2", "wall-1:3"]);
  });

  it("열린 연속선은 점 수 - 1개다", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(wallToBoxes(wall(points))).toHaveLength(2);
  });

  it("엣지: 점이 1개뿐이거나 없는 벽은 박스가 없다", () => {
    expect(wallToBoxes(wall([{ x: 10, y: 10 }]))).toEqual([]);
    expect(wallToBoxes(wall([]))).toEqual([]);
    expect(wallToBoxes(wall([{ x: 10, y: 10 }], true))).toEqual([]);
  });

  it("엣지: 길이 0 선분은 건너뛰고 선분 번호는 그대로 둔다", () => {
    const boxes = wallToBoxes(
      wall([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    );
    expect(boxes.map((box) => box.key)).toEqual(["wall-1:1"]);
  });

  it("엣지: 원본 벽을 바꾸지 않는다", () => {
    const original = Object.freeze(
      wall([Object.freeze({ x: 0, y: 0 }), Object.freeze({ x: 100, y: 0 })], true),
    );
    Object.freeze(original.points);
    expect(() => wallToBoxes(original)).not.toThrow();
    expect(original.points).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
  });
});
