import { describe, expect, it } from "vitest";
import type { Box, FurnitureType } from "@/shared/types";
import type { FurniturePart } from "./furniturePart";
import { furnitureParts } from "./furnitureParts";

const EPSILON = 1e-9;
const STORAGE: FurnitureType[] = ["cabinet", "drawer", "shelf", "wall"];

const box = (patch: Partial<Box>): Box => ({
  id: "box_1",
  name: "가구",
  type: "box",
  x: 0,
  z: 0,
  rotation: 0,
  w: 60,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 3,
  cols: 1,
  items: [],
  ...patch,
});

/** 부품이 차지하는 [작은 쪽, 큰 쪽] (가구 로컬 cm). */
const bounds = (part: FurniturePart) =>
  part.position.map((center, axis) => {
    const half = (part.size[axis] ?? 0) / 2;
    return [center - half, center + half];
  });

/** 모든 부품이 가로·높이·깊이 안이고 크기가 0보다 큰지. */
function expectInside(target: Box) {
  const limits = [
    [-target.w / 2, target.w / 2],
    [0, target.h],
    [-target.d / 2, target.d / 2],
  ];
  for (const part of furnitureParts(target)) {
    part.size.forEach((size) => expect(size, part.key).toBeGreaterThan(0));
    bounds(part).forEach(([low = 0, high = 0], axis) => {
      expect(low, `${part.key} ${axis}`).toBeGreaterThanOrEqual((limits[axis]?.[0] ?? 0) - EPSILON);
      expect(high, `${part.key} ${axis}`).toBeLessThanOrEqual((limits[axis]?.[1] ?? 0) + EPSILON);
    });
  }
}

const keysOf = (target: Box) => furnitureParts(target).map((part) => part.key);
const partOf = (target: Box, key: string) =>
  furnitureParts(target).find((part) => part.key === key);

describe("furnitureParts", () => {
  it("수납 가구 4종은 부품이 모두 가구 크기 안이다 (60 × 50 × 90, 180cm 양문 수납장)", () => {
    for (const type of STORAGE) expectInside(box({ type }));
    expectInside(box({ type: "cabinet", w: 120, d: 60, h: 180, rows: 4, cols: 2 }));
  });

  it("양문 수납장: 몸통 + 문 두 짝(가운데 틈) + 손잡이 2개, 문·손잡이는 정면 쪽", () => {
    const cabinet = box({ type: "cabinet" });
    expect(keysOf(cabinet)).toEqual([
      "body",
      "door-left",
      "door-right",
      "handle-left",
      "handle-right",
    ]);
    const [left, right] = [partOf(cabinet, "door-left"), partOf(cabinet, "door-right")];
    const leftEdge = (left?.position[0] ?? 0) + (left?.size[0] ?? 0) / 2;
    const rightEdge = (right?.position[0] ?? 0) - (right?.size[0] ?? 0) / 2;
    expect(leftEdge).toBeCloseTo(-0.5); // 가운데 틈 1cm를 두고 양쪽이 같다
    expect(rightEdge).toBeCloseTo(0.5);
    for (const key of ["door-left", "handle-right"]) {
      expect(partOf(cabinet, key)?.position[2] ?? 0, key).toBeGreaterThan(20);
    }
  });

  it("서랍장: 칸 수만큼 서랍 앞판과 손잡이, 위 칸부터 번호가 붙고 정면 쪽이다", () => {
    const drawer = box({ type: "drawer", rows: 3 });
    expect(keysOf(drawer)).toEqual([
      "body",
      "front-0",
      "handle-0",
      "front-1",
      "handle-1",
      "front-2",
      "handle-2",
    ]);
    const heights = [0, 1, 2].map((row) => partOf(drawer, `front-${row}`)?.position[1] ?? 0);
    expect(heights[0]).toBeGreaterThan(heights[1] ?? 0); // 0번이 맨 위
    expect(partOf(drawer, "front-2")?.position[2] ?? 0).toBeGreaterThan(20);
  });

  it("선반: 옆판·뒤판·위아래 판 + 칸 사이 선반 판, 정면을 막는 판이 없다", () => {
    const shelf = box({ type: "shelf", rows: 4 });
    expect(keysOf(shelf)).toEqual([
      "side-left",
      "side-right",
      "back",
      "top",
      "bottom",
      "board-0",
      "board-1",
      "board-2",
    ]);
    const back = partOf(shelf, "back");
    expect((back?.position[2] ?? 0) + (back?.size[2] ?? 0) / 2).toBeLessThan(-20); // 뒤판은 뒤쪽
    const frontCovers = furnitureParts(shelf).filter(
      (part) => part.size[0] >= 50 && part.size[1] >= 80 && part.position[2] > 0,
    );
    expect(frontCovers).toEqual([]);
  });

  it("벽걸이는 선반과 같은 모양이다", () => {
    expect(keysOf(box({ type: "wall", rows: 2 }))).toEqual(keysOf(box({ type: "shelf", rows: 2 })));
  });

  it("엣지: 칸 높이를 정해 두면 그 자리에 선반 판이 온다 (위 칸 50 · 30 · 20cm)", () => {
    const shelf = box({ type: "shelf", h: 100, rows: 3, rowHeights: [50, 30, 20] });
    expect(partOf(shelf, "board-0")?.position[1]).toBeCloseTo(50);
    expect(partOf(shelf, "board-1")?.position[1]).toBeCloseTo(20);
  });

  it("엣지: 칸 1개면 칸 사이 판이 없고, 칸 10개·판 두께보다 작은 가구도 부품이 가구 안이다", () => {
    expect(
      keysOf(box({ type: "shelf", rows: 1 })).filter((key) => key.startsWith("board-")),
    ).toEqual([]);
    for (const type of STORAGE) {
      expectInside(box({ type, rows: 10 }));
      expectInside(box({ type, w: 3, d: 3, h: 3, rows: 10 }));
    }
  });

  it("책상·테이블: 상판 + 다리 4개, 다리는 바닥부터 상판 아래까지이고 모두 가구 크기 안이다", () => {
    for (const type of ["desk", "table"] as const) {
      const table = box({ type, w: 120, d: 60, h: 73 });
      expect(keysOf(table)).toEqual(["top", "leg-0-0", "leg-0-1", "leg-1-0", "leg-1-1"]);
      expectInside(table);
      const leg = partOf(table, "leg-1-1");
      expect((leg?.position[1] ?? 0) - (leg?.size[1] ?? 0) / 2).toBeCloseTo(0);
      expect((leg?.position[1] ?? 0) + (leg?.size[1] ?? 0) / 2).toBeCloseTo(70); // 상판 3cm 아래
    }
  });

  it("엣지: 다리 굵기(5cm)보다 좁은(4cm)·상판보다 낮은(2cm) 책상도 부품이 가구 안이다", () => {
    expectInside(box({ type: "desk", w: 4, d: 4, h: 73 }));
    expectInside(box({ type: "table", h: 2 }));
  });

  it("침대: 정면 반대쪽 머리판(40cm 더 높음) + 프레임 + 매트리스(윗면 = 침대 높이)", () => {
    const bed = box({ type: "bed", w: 160, d: 200, h: 45 });
    expect(keysOf(bed)).toEqual(["headboard", "frame", "mattress"]);
    const headboard = partOf(bed, "headboard");
    expect((headboard?.position[2] ?? 0) + (headboard?.size[2] ?? 0) / 2).toBeCloseTo(-90); // 뒤 10cm
    expect((headboard?.position[1] ?? 0) + (headboard?.size[1] ?? 0) / 2).toBeCloseTo(85);
    const mattress = partOf(bed, "mattress");
    expect((mattress?.position[1] ?? 0) + (mattress?.size[1] ?? 0) / 2).toBeCloseTo(45);
    expect(mattress?.color).toBe("#F7EFE3");
    expect(headboard?.size[0]).toBe(160); // 머리판은 침대 가로 그대로
  });

  it("엣지: 낮은(10cm)·작은(10 × 10cm) 침대도 프레임·매트리스가 가구 안이다", () => {
    for (const bed of [box({ type: "bed", h: 10 }), box({ type: "bed", w: 10, d: 10 })]) {
      const parts = furnitureParts(bed).filter((part) => part.key !== "headboard");
      for (const part of parts) {
        expect(
          part.size.every((size) => size > 0),
          part.key,
        ).toBe(true);
        expect(part.position[1] + part.size[1] / 2, part.key).toBeLessThanOrEqual(bed.h + EPSILON);
      }
    }
  });

  it("보관함: 상자 + 정면 위쪽 손잡이 홈 (가로의 40%, 최대 20cm, 정면으로 반만큼 나옴)", () => {
    const handle = partOf(box({}), "handle");
    expect(handle?.size).toEqual([20, 3, 1]);
    expect(handle?.position).toEqual([0, 72, 25]);
    expect(partOf(box({ w: 30 }), "handle")?.size[0]).toBe(12);
  });

  it("엣지: 아주 낮은 보관함(4cm)도 손잡이 홈이 가구 높이 안이다", () => {
    const handle = partOf(box({ h: 4 }), "handle");
    expect((handle?.position[1] ?? 0) + (handle?.size[1] ?? 0) / 2).toBeLessThanOrEqual(4);
  });
});
