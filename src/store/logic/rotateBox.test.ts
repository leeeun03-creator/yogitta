import { describe, expect, it } from "vitest";
import { createBoxTestData } from "./boxFixtures";
import { rotateBox } from "./rotateBox";
import { deepFreeze } from "./spaceFixtures";

describe("rotateBox", () => {
  it("그 가구만 시계 방향으로 90도 돌린다", () => {
    const data = rotateBox(createBoxTestData([{}, { x: 100, z: 100 }]), "box_2");
    expect(data.spaces[0]?.boxes[0]?.rotation).toBe(0);
    expect(data.spaces[0]?.boxes[1]?.rotation).toBe(90);
  });

  it("엣지: 270도에서 돌리면 0도가 된다", () => {
    const data = rotateBox(createBoxTestData([{ rotation: 270 }]), "box_1");
    expect(data.spaces[0]?.boxes[0]?.rotation).toBe(0);
  });

  it("엣지: 좁은 바닥에서 길쭉한 가구는 돌리지 않고 원본 그대로다", () => {
    const original = createBoxTestData([{ w: 300, d: 40, x: 150, z: 100 }], { w: 300, h: 200 });
    expect(rotateBox(original, "box_1")).toBe(original);
  });

  it("엣지: 돌린 모양이 다른 가구에 파고들면 돌리지 않고 원본 그대로다", () => {
    // 200 × 40 가구를 돌리면 세로 200(y 100 ~ 300)이 되어 아래 가구(y 255 ~ 305)를 뚫는다
    const original = createBoxTestData([
      { w: 200, d: 40, x: 300, z: 200 },
      { x: 300, z: 280 },
    ]);
    expect(rotateBox(original, "box_1")).toBe(original);
  });

  it("엣지: 없는 가구면 그대로 둔다", () => {
    const original = createBoxTestData([{}]);
    expect(rotateBox(original, "box_9")).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    expect(rotateBox(original, "box_1").spaces[0]?.boxes[0]?.rotation).toBe(90);
  });
});
