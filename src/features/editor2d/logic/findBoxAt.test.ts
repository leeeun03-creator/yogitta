import { describe, expect, it } from "vitest";
import type { Box } from "@/shared/types";
import { findBoxAt } from "./findBoxAt";

const box = (id: string, x: number, z: number, rotation = 0): Box => ({
  id,
  name: id,
  type: "box",
  x,
  z,
  rotation,
  w: 100,
  d: 40,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
});

describe("findBoxAt", () => {
  it("누른 자리가 가구 안이면 그 가구, 밖이면 null", () => {
    const boxes = [box("a", 200, 100)];
    expect(findBoxAt(boxes, { x: 240, y: 110 })?.id).toBe("a");
    expect(findBoxAt(boxes, { x: 260, y: 100 })).toBeNull();
  });

  it("엣지: 가장자리 위도 가구 안으로 본다", () => {
    expect(findBoxAt([box("a", 200, 100)], { x: 250, y: 120 })?.id).toBe("a");
  });

  it("엣지: 겹쳐 있으면 나중에 놓은(위에 그려진) 가구", () => {
    const boxes = [box("a", 200, 100), box("b", 230, 100)];
    expect(findBoxAt(boxes, { x: 220, y: 100 })?.id).toBe("b");
    expect(findBoxAt(boxes, { x: 160, y: 100 })?.id).toBe("a");
  });

  it("엣지: 90도 돌린 가구는 돌린 모양(가로·깊이가 바뀜)으로 본다", () => {
    const boxes = [box("a", 200, 100, 90)];
    expect(findBoxAt(boxes, { x: 200, y: 145 })?.id).toBe("a");
    expect(findBoxAt(boxes, { x: 240, y: 100 })).toBeNull();
  });

  it("엣지: 가구가 없으면 null", () => {
    expect(findBoxAt([], { x: 0, y: 0 })).toBeNull();
  });
});
