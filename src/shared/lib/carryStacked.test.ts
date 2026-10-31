import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { carryStacked } from "./carryStacked";
import { STACK_DESK, stackBox } from "./stackFixtures";

const FLOOR = { w: 600, h: 450 };
// 책상 (300, 200) 위 오른쪽에 보관함(top), 그 위에 또 하나(topmost), 바닥에 다른 가구(floor)
const top = stackBox("top", { x: 340, z: 200, elevation: 73, parentId: "desk" });
const topmost = stackBox("topmost", { x: 340, z: 200, elevation: 113, parentId: "top" });
const floorBox = stackBox("floor");
const boxes = [STACK_DESK, top, topmost, floorBox];
const find = (list: readonly Box[], id: string) => list.find((box) => box.id === id);

describe("carryStacked", () => {
  it("받침 가구를 옮긴 만큼 그 위 가구(두 층 포함)도 옮기고, 다른 가구는 그대로다", () => {
    const after = { ...STACK_DESK, x: 200, z: 300 };
    const carried = carryStacked(boxes, STACK_DESK, after, FLOOR);
    expect(find(carried, "top")).toMatchObject({ x: 240, z: 300, elevation: 73 });
    expect(find(carried, "topmost")).toMatchObject({ x: 240, z: 300, elevation: 113 });
    expect(find(carried, "floor")).toBe(floorBox);
  });

  it("받침 가구를 시계 방향 90도 돌리면 그 위 가구는 받침 가구 가운데를 축으로 같이 돈다 (오른쪽 → 아래)", () => {
    const after = { ...STACK_DESK, rotation: 90 };
    expect(find(carryStacked(boxes, STACK_DESK, after, FLOOR), "top")).toMatchObject({
      x: 300,
      z: 240,
      rotation: 90,
    });
    const back = { ...STACK_DESK, rotation: 0 };
    const from270 = { ...STACK_DESK, rotation: 270 };
    // 270 → 0도 한 번 더 돌림 (한 바퀴를 넘어감)
    expect(find(carryStacked([from270, top], from270, back, FLOOR), "top")).toMatchObject({
      x: 300,
      z: 240,
      rotation: 90,
    });
  });

  it("받침 가구 높이가 바뀌면 윗면이 바뀐 만큼 설치 높이가 바뀐다", () => {
    const after = { ...STACK_DESK, h: 100 };
    const carried = carryStacked(boxes, STACK_DESK, after, FLOOR);
    expect(find(carried, "top")?.elevation).toBe(100);
    expect(find(carried, "topmost")?.elevation).toBe(140);
  });

  it("엣지: 바닥 가장자리로 옮겨 그 위 가구가 바닥 밖으로 나가면 안으로 당긴다", () => {
    const after = { ...STACK_DESK, x: 560 }; // top 가운데가 600 → 바닥 안 580 (가로 40)
    expect(find(carryStacked(boxes, STACK_DESK, after, FLOOR), "top")?.x).toBe(580);
  });

  it("엣지: 자리·높이·방향이 그대로면(이름만 바뀜 등) 목록을 그대로 돌려준다", () => {
    const renamed = { ...STACK_DESK, name: "새 책상" };
    expect(carryStacked(boxes, STACK_DESK, renamed, FLOOR)).toBe(boxes);
  });
});
