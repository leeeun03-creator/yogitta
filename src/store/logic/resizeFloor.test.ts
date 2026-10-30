import { describe, expect, it } from "vitest";
import type { AppData, Box, Space } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { resizeFloor } from "./resizeFloor";
import { deepFreeze } from "./spaceFixtures";

/** 바닥 600 × 450 공간에 patch를 덧붙인 데이터 (가구는 boxes로). */
function dataWith(patch: Partial<Space> = {}, boxes: Partial<Box>[] = []): AppData {
  const base = createBoxTestData(boxes);
  const [mine, other] = base.spaces;
  if (!mine || !other) throw new Error("테스트 공간이 없다");
  return { ...base, spaces: [{ ...mine, ...patch }, other] };
}
const floorOf = (data: AppData) => data.spaces[0]?.floor;
const WALL = (x: number) => ({
  id: "wall_1",
  tool: "line" as const,
  points: [
    { x, y: 0 },
    { x, y: 100 },
  ],
  closed: false,
});

describe("resizeFloor", () => {
  it("늘리면 바뀌고, 다른 공간은 그대로다", () => {
    const result = resizeFloor(dataWith(), { w: 800, h: 500 });
    expect(result.ok && floorOf(result.data)).toEqual({ w: 800, h: 500 });
    expect(result.ok && result.data.spaces[1]?.floor).toEqual({ w: 600, h: 450 });
  });

  it("줄여서 벽이 바닥 밖으로 나가면 막고, 벽 끝이 경계에 딱 걸리면 된다", () => {
    const data = dataWith({ walls: [WALL(500)] });
    expect(resizeFloor(data, { w: 400, h: 450 })).toEqual({ ok: false, reason: "outside" });
    expect(resizeFloor(data, { w: 500, h: 450 }).ok).toBe(true);
  });

  it("엣지: 구역 선·구역 기준점·가구(돌린 모양)가 나가도 막는다", () => {
    const line = {
      id: "line_1",
      points: [
        { x: 0, y: 300 },
        { x: 600, y: 300 },
      ],
    };
    expect(resizeFloor(dataWith({ roomLines: [line] }), { w: 500, h: 450 }).ok).toBe(false);
    expect(
      resizeFloor(dataWith({ roomAnchors: { 안방: { x: 550, y: 50 } } }), { w: 500, h: 450 }).ok,
    ).toBe(false);
    // 가운데 (300, 200)인 100 × 300 가구를 90도 돌리면 세로 100(y 150 ~ 250)이라 세로 260이면 들어간다
    const turned = dataWith({}, [{ w: 100, d: 300, rotation: 90 }]);
    expect(resizeFloor(turned, { w: 600, h: 260 }).ok).toBe(true);
    expect(resizeFloor(turned, { w: 600, h: 240 }).ok).toBe(false);
  });

  it("엣지: 같은 크기면 원본 그대로이고, 원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(dataWith());
    const same = resizeFloor(original, { w: 600, h: 450 });
    expect(same.ok && same.data).toBe(original);
    const larger = resizeFloor(original, { w: 700, h: 450 });
    expect(larger.ok && floorOf(larger.data)).toEqual({ w: 700, h: 450 });
  });
});
