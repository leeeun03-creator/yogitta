import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { boxToMesh } from "./boxToMesh";

const BOX: Box = {
  id: "box_1",
  name: "보관함 1",
  type: "box",
  x: 200,
  z: 125,
  rotation: 0,
  w: 60,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
};

/** 소수 오차를 반올림하고 -0은 0으로 둔다 (toEqual은 -0과 0을 다르게 본다). */
const round = (value: number) => Math.round(value) + 0;

/** three.js에서 y축으로 φ 돌린 가구의 정면(로컬 +z) 방향 (x, z). */
const front3D = (rotationY: number) => [round(Math.sin(rotationY)), round(Math.cos(rotationY))];

/** 2D 평면도(SVG, y가 아래)에서 시계 방향 θ도 돌린 가구의 정면(로컬 +y) 방향 (x, y). */
const front2D = (rotation: number) => {
  const angle = (rotation * Math.PI) / 180;
  return [round(-Math.sin(angle)), round(Math.cos(angle))];
};

describe("boxToMesh", () => {
  it("같은 자리(2D y = 3D z)·크기로 바닥 위에 세운다", () => {
    const mesh = boxToMesh(BOX);
    expect(mesh).toMatchObject({ key: "box_1", x: 200, z: 125, base: 0, w: 60, h: 90, d: 50 });
    expect(mesh.rotationY).toBeCloseTo(0);
  });

  it("엣지: 0·90·180·270도에서 3D 정면이 2D 정면 삼각형 쪽이다 (2D y = 3D z)", () => {
    const expected: Record<number, number[]> = {
      0: [0, 1], // 아래(+y) = +z
      90: [-1, 0], // 왼쪽 = -x
      180: [0, -1], // 위 = -z
      270: [1, 0], // 오른쪽 = +x
    };
    for (const rotation of [0, 90, 180, 270]) {
      const mesh = boxToMesh({ ...BOX, rotation });
      expect(front3D(mesh.rotationY)).toEqual(expected[rotation]);
      expect(front3D(mesh.rotationY)).toEqual(front2D(rotation));
    }
  });

  it("손잡이 홈은 정면(로컬 +z) 위쪽에 가로의 40% 폭으로 붙는다 (최대 20cm)", () => {
    expect(boxToMesh(BOX).handle).toEqual({ width: 20, height: 3, y: 72, z: 25.5 });
    expect(boxToMesh({ ...BOX, w: 30 }).handle.width).toBe(12);
  });

  it("엣지: 아주 낮은 가구(4cm)도 손잡이 홈이 가구 높이 안이다", () => {
    const { handle } = boxToMesh({ ...BOX, h: 4 });
    expect(handle.y + handle.height / 2).toBeLessThanOrEqual(4 + 1);
    expect(handle.height).toBe(2);
  });

  it("엣지: 설치 높이가 있으면 그만큼 떠서 선다", () => {
    expect(boxToMesh({ ...BOX, elevation: 120 }).base).toBe(120);
  });
});
