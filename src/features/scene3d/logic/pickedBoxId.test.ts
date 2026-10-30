import { describe, expect, it } from "vitest";
import { pickedBoxId } from "./pickedBoxId";

type Node = { userData: Record<string, unknown>; parent: Node | null };
const node = (userData: Record<string, unknown> = {}, parent: Node | null = null): Node => ({
  userData,
  parent,
});

describe("pickedBoxId", () => {
  it("부품의 위로 올라가 가구 묶음의 id를 찾는다", () => {
    const box = node({ boxId: "box_1" });
    const part = node({}, box);
    expect(pickedBoxId([part])).toBe("box_1");
  });

  it("엣지: 앞에 있는 벽·바닥은 건너뛰고 뒤의 가구를 찾는다 (가까운 가구가 먼저)", () => {
    const wall = node();
    const near = node({}, node({ boxId: "box_2" }));
    const far = node({}, node({ boxId: "box_1" }));
    expect(pickedBoxId([wall, near, far])).toBe("box_2");
  });

  it("엣지: 가구가 없거나 id가 글자가 아니면 null", () => {
    expect(pickedBoxId([])).toBeNull();
    expect(pickedBoxId([node(), node({ boxId: 3 })])).toBeNull();
  });
});
