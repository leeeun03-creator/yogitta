import { describe, expect, it } from "vitest";
import { WALL_HEIGHT_CM } from "@/shared/constants/scene";
import type { Floor } from "@/shared/types";
import { startCamera, type CameraStart } from "./startCamera";

const FOV = 30;

type Vector = readonly number[];
const dot = (a: Vector, b: Vector) => a.reduce((sum, value, i) => sum + value * (b[i] ?? 0), 0);
const minus = (a: Vector, b: Vector) => a.map((value, i) => value - (b[i] ?? 0));
const normalize = (v: Vector) => v.map((value) => value / Math.hypot(...v));
const cross = ([ax = 0, ay = 0, az = 0]: Vector, [bx = 0, by = 0, bz = 0]: Vector) => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];
const distanceOf = (camera: CameraStart) => Math.hypot(...minus(camera.position, camera.target));

/** 점이 카메라 화면(가로·세로 화각 절반, 가까운 면 ~ 먼 면) 안에 들어오는지 본다. */
function isInView(camera: CameraStart, point: Vector, aspect: number) {
  const forward = normalize(minus(camera.target, camera.position));
  const right = normalize(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  const relative = minus(point, camera.position);
  const depth = dot(relative, forward);
  const halfV = (FOV * Math.PI) / 360;
  const halfH = Math.atan(Math.tan(halfV) * aspect);
  return (
    depth > camera.near &&
    depth < camera.far &&
    Math.abs(Math.atan2(dot(relative, right), depth)) <= halfH &&
    Math.abs(Math.atan2(dot(relative, up), depth)) <= halfV
  );
}

/** 바닥 네 귀퉁이와 그 위 벽 높이 귀퉁이. */
const corners = ({ w, h }: Floor) =>
  [0, WALL_HEIGHT_CM].flatMap((y) => [
    [0, y, 0],
    [w, y, 0],
    [w, y, h],
    [0, y, h],
  ]);

describe("startCamera", () => {
  it("바닥 가운데를 본다", () => {
    expect(startCamera({ w: 600, h: 450 }, FOV, 1.5).target).toEqual([300, 0, 225]);
  });

  it("오른쪽 앞 대각선 위에 있다 (x·z가 바닥보다 크고 위에서 내려다본다)", () => {
    const [x, y, z] = startCamera({ w: 600, h: 450 }, FOV, 1.5).position;
    expect(x).toBeGreaterThan(600);
    expect(z).toBeGreaterThan(450);
    expect(y).toBeGreaterThan(0);
  });

  it("바닥과 벽 높이까지 모든 귀퉁이가 화면 안에 들어온다", () => {
    const floor = { w: 600, h: 450 };
    const camera = startCamera(floor, FOV, 1.5);
    for (const corner of corners(floor)) expect(isInView(camera, corner, 1.5)).toBe(true);
  });

  it("엣지: 아주 작은(1 × 1 m)·아주 큰(30 × 30 m) 바닥도 다 보인다", () => {
    for (const floor of [
      { w: 100, h: 100 },
      { w: 3000, h: 3000 },
    ]) {
      const camera = startCamera(floor, FOV, 1.5);
      for (const corner of corners(floor)) expect(isInView(camera, corner, 1.5)).toBe(true);
    }
  });

  it("엣지: 세로로 긴 화면(휴대폰)에서는 더 멀리 물러나 가로도 다 보인다", () => {
    const floor = { w: 600, h: 450 };
    const narrow = startCamera(floor, FOV, 0.5);
    const wide = startCamera(floor, FOV, 1.5);
    expect(distanceOf(narrow)).toBeGreaterThan(distanceOf(wide));
    for (const corner of corners(floor)) expect(isInView(narrow, corner, 0.5)).toBe(true);
  });

  it("엣지: 화면 크기가 0이어도(가로 / 세로가 0·무한) 숫자가 깨지지 않는다", () => {
    for (const aspect of [0, Number.POSITIVE_INFINITY, Number.NaN]) {
      const camera = startCamera({ w: 600, h: 450 }, FOV, aspect);
      expect(camera.position.every(Number.isFinite)).toBe(true);
    }
  });

  it("가까운 면은 바닥보다 앞에, 먼 면은 바닥보다 뒤에 있다", () => {
    const camera = startCamera({ w: 600, h: 450 }, FOV, 1.5);
    const distance = distanceOf(camera);
    const radius = Math.hypot(300, 225, WALL_HEIGHT_CM);
    expect(camera.near).toBeLessThan(distance - radius);
    expect(camera.far).toBeGreaterThan(distance + radius);
  });
});
