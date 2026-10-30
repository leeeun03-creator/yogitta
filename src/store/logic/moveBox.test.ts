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
});
