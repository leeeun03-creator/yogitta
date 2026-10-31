import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import type { CameraLimits } from "./cameraView";
import { focusView } from "./focusView";

const LENS = { fovDeg: 30, aspect: 1.5 };
const LIMITS: CameraLimits = { minDistance: 200, maxDistance: 2000, maxPolarAngle: 1.4 };
const drawer = (rotation: number, size: Partial<Box> = {}): Box => ({
  id: "box_1",
  name: "서랍장",
  type: "drawer",
  x: 300,
  z: 200,
  rotation,
  w: 80,
  d: 45,
  h: 90,
  elevation: 0,
  rows: 3,
  cols: 1,
  items: [],
  ...size,
});
const length = (v: number[]) => Math.hypot(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0);

describe("focusView", () => {
  it("가구 정면 쪽 위에서 본다 (2D 정면: 0도 +y, 90도 -x, 180도 -y, 270도 +x)", () => {
    expect(focusView(drawer(0), LENS, LIMITS).position[2]).toBeGreaterThan(200);
    expect(focusView(drawer(90), LENS, LIMITS).position[0]).toBeLessThan(300);
    expect(focusView(drawer(180), LENS, LIMITS).position[2]).toBeLessThan(200);
    expect(focusView(drawer(270), LENS, LIMITS).position[0]).toBeGreaterThan(300);
    expect(focusView(drawer(0), LENS, LIMITS).position[1]).toBeGreaterThan(90);
  });

  it("보는 곳은 바닥 위이고, 가구 가운데가 시선 위에 있어 화면 가운데에 온다", () => {
    const { position, target } = focusView(drawer(0), LENS, LIMITS);
    expect(target[1]).toBe(0);
    const toCamera = position.map((value, index) => value - (target[index] ?? 0));
    const toCenter = [300 - target[0], 45 - target[1], 200 - target[2]];
    const cross = [
      (toCamera[1] ?? 0) * (toCenter[2] ?? 0) - (toCamera[2] ?? 0) * (toCenter[1] ?? 0),
      (toCamera[2] ?? 0) * (toCenter[0] ?? 0) - (toCamera[0] ?? 0) * (toCenter[2] ?? 0),
      (toCamera[0] ?? 0) * (toCenter[1] ?? 0) - (toCamera[1] ?? 0) * (toCenter[0] ?? 0),
    ];
    expect(length(cross) / length(toCamera)).toBeLessThan(0.01); // 같은 직선 위
  });

  it("큰 가구일수록 멀리서 보고, 거리는 카메라 움직임 범위 안이다", () => {
    const distance = (box: Box) => {
      const { position, target } = focusView(box, LENS, LIMITS);
      return length(position.map((value, index) => value - (target[index] ?? 0)));
    };
    expect(distance(drawer(0, { w: 200, h: 200, d: 60 }))).toBeGreaterThan(distance(drawer(0)));
    expect(distance(drawer(0, { w: 10, h: 10, d: 10 }))).toBeCloseTo(200);
    expect(distance(drawer(0, { w: 3000, h: 240, d: 3000 }))).toBeCloseTo(2000);
  });

  it("keepDistance를 주면 가구에 맞춰 당기지 않고 그 거리로 돈다 (범위 안으로)", () => {
    const at = (keep: number) => {
      const { position, target } = focusView(drawer(0), LENS, LIMITS, keep);
      return length(position.map((value, index) => value - (target[index] ?? 0)));
    };
    expect(at(1200)).toBeCloseTo(1200);
    expect(at(50)).toBeCloseTo(200);
  });
});
