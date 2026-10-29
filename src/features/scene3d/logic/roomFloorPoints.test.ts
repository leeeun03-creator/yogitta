import { describe, expect, it } from "vitest";
import { FLOOR_GRID_LIFT_CM, ROOM_FLOOR_LIFT_CM } from "@/shared/constants/scene";
import { roomFloorPoints } from "./roomFloorPoints";

const XYZ = 3;

/** 점 목록을 [x, y, z] 묶음으로. */
const triples = (points: number[]) =>
  Array.from({ length: points.length / XYZ }, (_, index) =>
    points.slice(index * XYZ, index * XYZ + XYZ),
  );

describe("roomFloorPoints", () => {
  it("사각형 하나는 삼각형 2개(점 6개)이고, 2D y는 3D z다", () => {
    const points = triples(roomFloorPoints([{ x: 100, y: 50, w: 200, h: 10 }]));
    expect(points).toHaveLength(6);
    const xs = points.map(([x = 0]) => x);
    const zs = points.map(([, , z = 0]) => z);
    expect([Math.min(...xs), Math.max(...xs)]).toEqual([100, 300]);
    expect([Math.min(...zs), Math.max(...zs)]).toEqual([50, 60]);
  });

  it("바닥보다 위, 격자선보다 아래에 깐다 (바닥과 깜빡이지 않고 격자선은 보이게)", () => {
    const heights = new Set(
      triples(roomFloorPoints([{ x: 0, y: 0, w: 10, h: 10 }])).map(([, y]) => y),
    );
    expect([...heights]).toEqual([ROOM_FLOOR_LIFT_CM]);
    expect(ROOM_FLOOR_LIFT_CM).toBeGreaterThan(0);
    expect(ROOM_FLOOR_LIFT_CM).toBeLessThan(FLOOR_GRID_LIFT_CM);
  });

  it("위에서 보면 앞면이다 (삼각형 법선이 +y)", () => {
    const [a, b, c] = triples(roomFloorPoints([{ x: 0, y: 0, w: 10, h: 10 }]));
    if (!a || !b || !c) throw new Error("점이 모자란다");
    const [ax = 0, , az = 0] = a;
    const [bx = 0, , bz = 0] = b;
    const [cx = 0, , cz = 0] = c;
    // (ab) × (ac)의 y 성분 = ab.z·ac.x − ab.x·ac.z
    expect((bz - az) * (cx - ax) - (bx - ax) * (cz - az)).toBeGreaterThan(0);
  });

  it("엣지: 사각형이 없으면 점도 없고, 여러 개면 6개씩 이어 붙인다", () => {
    expect(roomFloorPoints([])).toEqual([]);
    const two = roomFloorPoints([
      { x: 0, y: 0, w: 10, h: 10 },
      { x: 0, y: 10, w: 10, h: 10 },
    ]);
    expect(two).toHaveLength(2 * 6 * XYZ);
  });
});
