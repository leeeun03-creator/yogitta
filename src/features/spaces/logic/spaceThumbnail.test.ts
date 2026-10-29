import { describe, expect, it } from "vitest";
import {
  THUMBNAIL_HEIGHT_PX,
  THUMBNAIL_PADDING_PX,
  THUMBNAIL_WIDTH_PX,
} from "@/shared/constants/spaceThumbnail";
import type { Point, Wall } from "@/shared/types";
import { spaceThumbnail } from "./spaceThumbnail";

const at = (x: number, y: number): Point => ({ x, y });
const wall = (points: Point[], closed = false): Wall => ({
  id: "wall_1",
  tool: closed ? "rect" : "line",
  points,
  closed,
});
const ROOM = { w: 600, h: 450 };
const EPSILON = 1e-6;

/** 썸네일의 모든 점. */
const allPoints = (thumbnail: ReturnType<typeof spaceThumbnail>) => [
  ...thumbnail.floor,
  ...thumbnail.walls.flatMap((face) => face.points),
];
/** 점들이 여백 안에 있고, 가로나 세로 한쪽은 여백까지 꽉 차는지. */
function expectFitted(points: Point[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  expect(minX).toBeGreaterThanOrEqual(THUMBNAIL_PADDING_PX - EPSILON);
  expect(maxX).toBeLessThanOrEqual(THUMBNAIL_WIDTH_PX - THUMBNAIL_PADDING_PX + EPSILON);
  expect(minY).toBeGreaterThanOrEqual(THUMBNAIL_PADDING_PX - EPSILON);
  expect(maxY).toBeLessThanOrEqual(THUMBNAIL_HEIGHT_PX - THUMBNAIL_PADDING_PX + EPSILON);
  const fillsWidth =
    Math.abs(maxX - minX - (THUMBNAIL_WIDTH_PX - THUMBNAIL_PADDING_PX * 2)) < EPSILON;
  const fillsHeight =
    Math.abs(maxY - minY - (THUMBNAIL_HEIGHT_PX - THUMBNAIL_PADDING_PX * 2)) < EPSILON;
  expect(fillsWidth || fillsHeight).toBe(true);
  // 가운데 맞춤: 양쪽 여백이 같다
  expect(minX).toBeCloseTo(THUMBNAIL_WIDTH_PX - maxX);
  expect(minY).toBeCloseTo(THUMBNAIL_HEIGHT_PX - maxY);
}

describe("spaceThumbnail", () => {
  it("바닥은 마름모로 보인다: (0,0) 모서리가 맨 위, 반대 모서리가 맨 아래, 가로 끝이 오른쪽", () => {
    const [origin, right, far, left] = spaceThumbnail({ floor: ROOM, walls: [] }).floor;
    expect(origin?.y).toBeLessThan(right?.y ?? 0);
    expect(far?.y).toBeGreaterThan(right?.y ?? 0);
    expect(right?.x).toBeGreaterThan(left?.x ?? 0);
  });

  it("바닥과 벽이 썸네일 칸 여백 안에 가운데로 꽉 찬다", () => {
    const rect = wall([at(0, 0), at(600, 0), at(600, 450), at(0, 450)], true);
    expectFitted(allPoints(spaceThumbnail({ floor: ROOM, walls: [rect] })));
  });

  it("닫힌 벽은 선분마다 면 하나(4개)이고, 벽 면은 바닥 위로 선다", () => {
    const rect = wall([at(0, 0), at(600, 0), at(600, 450), at(0, 450)], true);
    const thumbnail = spaceThumbnail({ floor: ROOM, walls: [rect] });
    expect(thumbnail.walls).toHaveLength(4);
    const [bottomA, bottomB, topB, topA] = thumbnail.walls[0]?.points ?? [];
    expect(topA?.y).toBeLessThan(bottomA?.y ?? 0);
    expect(topB?.x).toBeCloseTo(bottomB?.x ?? NaN);
  });

  it("벽은 뒤에서 앞 순서로 그리고, 가로로 긴 벽은 앞면·세로로 긴 벽은 옆면이다", () => {
    const back = wall([at(0, 0), at(600, 0)]);
    const front = wall([at(0, 400), at(600, 400)]);
    const side = wall([at(300, 0), at(300, 450)]);
    const faces = spaceThumbnail({ floor: ROOM, walls: [front, side, back] }).walls;
    expect(faces.map((face) => face.face)).toEqual(["front", "side", "front"]);
    expect(faces[0]?.points[0]?.y).toBeLessThan(faces[2]?.points[0]?.y ?? 0); // 뒤 벽이 먼저
  });

  it("엣지: 벽이 없으면 바닥만 있고 칸에 꽉 찬다", () => {
    const thumbnail = spaceThumbnail({ floor: ROOM, walls: [] });
    expect(thumbnail.walls).toEqual([]);
    expectFitted(thumbnail.floor);
  });

  it("엣지: 아주 길쭉한 바닥(30 × 1 m)도 칸 안에 들어간다", () => {
    expectFitted(spaceThumbnail({ floor: { w: 3000, h: 100 }, walls: [] }).floor);
    expectFitted(spaceThumbnail({ floor: { w: 100, h: 3000 }, walls: [] }).floor);
  });
});
