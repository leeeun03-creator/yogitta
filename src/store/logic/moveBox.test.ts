import { describe, expect, it } from "vitest";
import { createBoxTestData } from "./boxFixtures";
import { moveBox } from "./moveBox";
import { deepFreeze } from "./spaceFixtures";

describe("moveBox", () => {
  it("가구 가운데를 옮긴다 (2D y = 3D z), 다른 가구는 그대로다", () => {
    const data = moveBox(createBoxTestData([{}, { x: 100, z: 100 }]), "box_1", { x: 400, y: 300 });
    expect(data.spaces[0]?.boxes[0]).toMatchObject({ x: 400, z: 300 });
    expect(data.spaces[0]?.boxes[1]).toMatchObject({ x: 100, z: 100 });
  });

  it("엣지: 바닥 밖으로 끌면 가구 가장자리가 바닥 경계에 닿는 자리에서 멈춘다", () => {
    const data = moveBox(createBoxTestData([{}]), "box_1", { x: 700, y: -40 });
    expect(data.spaces[0]?.boxes[0]).toMatchObject({ x: 570, z: 25 });
  });

  it("엣지: 돌린 가구는 돌린 모양(가로·깊이가 바뀜)으로 바닥 안에 맞춘다", () => {
    const data = moveBox(createBoxTestData([{ rotation: 90 }]), "box_1", { x: 700, y: -40 });
    expect(data.spaces[0]?.boxes[0]).toMatchObject({ x: 575, z: 30 });
  });

  it("엣지: 자리가 그대로면 원본 그대로다 (되돌리기 기록이 늘지 않게)", () => {
    const original = createBoxTestData([{}]);
    expect(moveBox(original, "box_1", { x: 300, y: 200 })).toBe(original);
    // 바닥 밖으로 끌어도 당긴 자리가 지금 자리와 같으면 그대로다
    const atEdge = createBoxTestData([{ x: 570, z: 25 }]);
    expect(moveBox(atEdge, "box_1", { x: 900, y: -90 })).toBe(atEdge);
  });

  it("엣지: 없는 가구면 그대로 둔다", () => {
    const original = createBoxTestData([{}]);
    expect(moveBox(original, "box_9", { x: 10, y: 10 })).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    expect(moveBox(original, "box_1", { x: 100, y: 100 }).spaces[0]?.boxes[0]?.x).toBe(100);
  });

  it("받침 가구를 주면 그 위에 올리고(설치 높이 = 받침 가구 위), null이면 바닥으로 내린다", () => {
    const desk = { type: "desk" as const, x: 300, z: 200, w: 120, d: 60, h: 73 };
    const stacked = moveBox(
      createBoxTestData([desk, { x: 100, z: 100 }]),
      "box_2",
      { x: 300, y: 200 },
      "box_1",
    );
    expect(stacked.spaces[0]?.boxes[1]).toMatchObject({
      x: 300,
      z: 200,
      elevation: 73,
      parentId: "box_1",
    });
    const down = moveBox(stacked, "box_2", { x: 450, y: 200 }, null);
    expect(down.spaces[0]?.boxes[1]).toMatchObject({ x: 450, elevation: 0 });
    expect(down.spaces[0]?.boxes[1]?.parentId).toBeUndefined();
  });

  it("받침 가구를 주지 않으면(방향키) 받침 가구 위 그대로 옮긴다", () => {
    const data = createBoxTestData([{}, { elevation: 90, parentId: "box_1" }]);
    expect(moveBox(data, "box_2", { x: 310, y: 200 }).spaces[0]?.boxes[1]).toMatchObject({
      x: 310,
      elevation: 90,
      parentId: "box_1",
    });
  });

  it("엣지: 올릴 수 없는 가구(자기 위 가구, 벽걸이, 없는 가구) 위로는 옮기지 않는다", () => {
    const data = createBoxTestData([
      {},
      { elevation: 90, parentId: "box_1" },
      { type: "wall", x: 100, z: 100 },
    ]);
    expect(moveBox(data, "box_1", { x: 300, y: 200 }, "box_2")).toBe(data);
    expect(moveBox(data, "box_3", { x: 300, y: 200 }, "box_1")).toBe(data);
    expect(moveBox(data, "box_1", { x: 300, y: 200 }, "box_9")).toBe(data);
  });

  it("엣지: 받침 가구가 없어진 가구 위 가구(깨진 데이터)를 방향키로 옮기면 바닥으로 내려온다", () => {
    const data = createBoxTestData([{ elevation: 90, parentId: "gone" }]);
    const moved = moveBox(data, "box_1", { x: 310, y: 200 }).spaces[0]?.boxes[0];
    expect(moved).toMatchObject({ x: 310, elevation: 0 });
    expect(moved?.parentId).toBeUndefined();
  });
});
