import { describe, expect, it } from "vitest";
import { findBase } from "./findBase";
import { STACK_DESK, stackBox } from "./stackFixtures";

describe("findBase", () => {
  const small = stackBox("small");

  it("가운데가 윗면 안(가장자리 포함)이면 그 가구, 밖이면 null (책상 x 240~360, y 170~230)", () => {
    const boxes = [STACK_DESK, small];
    expect(findBase(boxes, small, { x: 300, y: 200 })?.id).toBe("desk");
    expect(findBase(boxes, small, { x: 360, y: 230 })?.id).toBe("desk");
    expect(findBase(boxes, small, { x: 361, y: 200 })).toBeNull();
  });

  it("겹쳐 있으면 맨 위 가구다 (책상 위 보관함 위로 끌면 보관함)", () => {
    const top = stackBox("top", { x: 300, z: 200, elevation: 73, parentId: "desk" });
    expect(findBase([STACK_DESK, top, small], small, { x: 300, y: 200 })?.id).toBe("top");
    expect(findBase([top, STACK_DESK, small], small, { x: 300, y: 200 })?.id).toBe("top"); // 순서와 상관없다
    expect(findBase([STACK_DESK, top, small], small, { x: 250, y: 200 })?.id).toBe("desk");
  });

  it("엣지: 올릴 수 없는 가구(자기 자신, 자기 위 가구, 벽걸이)는 건너뛴다", () => {
    const top = stackBox("top", { x: 300, z: 200, elevation: 73, parentId: "desk" });
    expect(findBase([STACK_DESK, top], STACK_DESK, { x: 300, y: 200 })).toBeNull();
    const shelf = stackBox("shelf", { type: "wall", x: 300, z: 200, elevation: 150 });
    expect(findBase([STACK_DESK, shelf, small], small, { x: 300, y: 200 })?.id).toBe("desk");
  });
});
