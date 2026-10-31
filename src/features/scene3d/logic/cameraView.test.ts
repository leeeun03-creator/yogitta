import { describe, expect, it } from "vitest";
import {
  CAMERA_MAX_DISTANCE_RATIO,
  CAMERA_MIN_DISTANCE_CM,
  CAMERA_ZOOM_STEP,
  PREVIEW_FOV_DEG,
} from "@/shared/constants/scene";
import {
  cameraLimits,
  clampTarget,
  type CameraView,
  keepViewOnFloor,
  viewStatus,
  zoomDistance,
  zoomView,
  lerpView,
} from "./cameraView";
import { startCamera, type Vector } from "./startCamera";

const FLOOR = { w: 600, h: 450 };
const start = startCamera(FLOOR, PREVIEW_FOV_DEG, 1.5);
const limits = cameraLimits(start);
/** 보는 곳 → 카메라 방향 벡터. */
const offset = (camera: { position: Vector; target: Vector }): Vector => [
  camera.position[0] - camera.target[0],
  camera.position[1] - camera.target[1],
  camera.position[2] - camera.target[2],
];
const startDistance = Math.hypot(...offset(start));
/** 보는 곳에서 distance만큼 처음 방향으로 떨어진 자리. */
function at(distance: number): Vector {
  const [x, y, z] = offset(start);
  const ratio = distance / startDistance;
  const [tx, ty, tz] = start.target;
  return [tx + x * ratio, ty + y * ratio, tz + z * ratio];
}

describe("cameraLimits", () => {
  it("가까운 끝은 200cm, 먼 끝은 처음 거리의 2.5배다", () => {
    expect(limits.minDistance).toBe(CAMERA_MIN_DISTANCE_CM);
    expect(limits.maxDistance).toBeCloseTo(startDistance * CAMERA_MAX_DISTANCE_RATIO);
  });

  it("엣지: 바닥 아래로 돌아가지 않는다 (내려다보는 각도 끝이 90도보다 작다)", () => {
    expect(limits.maxPolarAngle).toBeGreaterThan(0);
    expect(limits.maxPolarAngle).toBeLessThan(Math.PI / 2);
  });

  it("엣지: 아주 작은(1 × 1 m)·아주 큰(30 × 30 m) 바닥도 처음 거리가 범위 안이다", () => {
    for (const size of [100, 3000]) {
      const small = startCamera({ w: size, h: size }, PREVIEW_FOV_DEG, 0.5);
      const range = cameraLimits(small);
      const distance = Math.hypot(...offset(small));
      expect(range.minDistance).toBeLessThanOrEqual(distance);
      expect(range.maxDistance).toBeGreaterThan(distance);
      // 먼 끝까지 물러나도 바닥이 먼 면(far) 안에 있다
      expect(range.maxDistance + Math.hypot(size, size)).toBeLessThan(small.far);
    }
  });
});

describe("zoomDistance", () => {
  it("확대하면 가까워지고, 축소하면 멀어진다", () => {
    expect(zoomDistance(1000, "in", limits)).toBeCloseTo(1000 / CAMERA_ZOOM_STEP);
    expect(zoomDistance(1000, "out", limits)).toBeCloseTo(1000 * CAMERA_ZOOM_STEP);
  });

  it("엣지: 너무 가깝거나 멀리 가지 않는다", () => {
    expect(zoomDistance(limits.minDistance, "in", limits)).toBe(limits.minDistance);
    expect(zoomDistance(limits.maxDistance, "out", limits)).toBe(limits.maxDistance);
    expect(zoomDistance(limits.minDistance + 1, "in", limits)).toBe(limits.minDistance);
  });
});

describe("viewStatus", () => {
  it("처음 자리면 처음 보기이고, 확대·축소가 다 된다", () => {
    expect(viewStatus(start, start, limits)).toEqual({
      isStart: true,
      canZoomIn: true,
      canZoomOut: true,
    });
  });

  it("움직이면 처음 보기가 아니다 (1cm 안의 오차는 같은 자리)", () => {
    const moved = { position: at(startDistance * 1.5), target: start.target };
    expect(viewStatus(moved, start, limits).isStart).toBe(false);
    const nearly = { position: at(startDistance + 0.5), target: start.target };
    expect(viewStatus(nearly, start, limits).isStart).toBe(true);
  });

  it("엣지: 가까운 끝에서는 확대가, 먼 끝에서는 축소가 막힌다", () => {
    const closest = { position: at(limits.minDistance), target: start.target };
    expect(viewStatus(closest, start, limits)).toMatchObject({
      canZoomIn: false,
      canZoomOut: true,
    });
    const farthest = { position: at(limits.maxDistance), target: start.target };
    expect(viewStatus(farthest, start, limits)).toMatchObject({
      canZoomIn: true,
      canZoomOut: false,
    });
  });
});

describe("clampTarget", () => {
  it("바닥 안이면 그대로, 높이는 바닥(0)이다", () => {
    expect(clampTarget([100, 30, 200], FLOOR)).toEqual([100, 0, 200]);
  });

  it("엣지: 바닥 밖으로 나가면 가장자리로 당긴다", () => {
    expect(clampTarget([-50, 0, 900], FLOOR)).toEqual([0, 0, 450]);
    expect(clampTarget([700, 0, -1], FLOOR)).toEqual([600, 0, 0]);
  });
});

describe("zoomView", () => {
  it("보는 곳은 그대로, 같은 방향으로 거리만 바뀐다", () => {
    const zoomed = zoomView(start, "in", limits);
    expect(zoomed.target).toEqual(start.target);
    const expected = at(startDistance / CAMERA_ZOOM_STEP);
    zoomed.position.forEach((value, axis) => expect(value).toBeCloseTo(expected[axis] ?? NaN));
  });

  it("엣지: 카메라가 보는 곳과 같은 자리면(거리 0) 그대로 둔다", () => {
    const same = { position: start.target, target: start.target };
    expect(zoomView(same, "out", limits)).toBe(same);
  });
});

describe("keepViewOnFloor", () => {
  it("보는 곳이 바닥 안이면 그대로 돌려준다", () => {
    expect(keepViewOnFloor(start, FLOOR)).toBe(start);
  });

  it("엣지: 바닥 밖이면 카메라도 같은 만큼 옮겨 보는 방향을 지킨다", () => {
    const outside: CameraView = { position: [900, 500, 300], target: [700, 0, 100] };
    expect(keepViewOnFloor(outside, FLOOR)).toEqual({
      position: [800, 500, 300],
      target: [600, 0, 100],
    });
  });
});

describe("lerpView", () => {
  const from: CameraView = { position: [0, 100, 0], target: [0, 0, 0] };
  const to: CameraView = { position: [100, 200, 300], target: [10, 0, 20] };

  it("t만큼 카메라 자리와 보는 곳을 함께 옮긴다", () => {
    expect(lerpView(from, to, 0.5)).toEqual({ position: [50, 150, 150], target: [5, 0, 10] });
  });

  it("엣지: 0이면 처음, 1이면 끝", () => {
    expect(lerpView(from, to, 0)).toEqual(from);
    expect(lerpView(from, to, 1)).toEqual(to);
  });
});
