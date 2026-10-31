import { describe, expect, it } from "vitest";
import { STACK_DESK, stackBox } from "@/shared/lib/stackFixtures";
import { stackOrder } from "./stackOrder";

describe("stackOrder", () => {
  it("낮은 가구부터 늘어놓고, 같은 높이면 원래 순서를 지킨다 (원본은 그대로)", () => {
    const top = stackBox("top", { elevation: 73, parentId: "desk" });
    const shelf = stackBox("shelf", { type: "wall", elevation: 150 });
    const boxes = [top, shelf, STACK_DESK, stackBox("floor")];
    expect(stackOrder(boxes).map((box) => box.id)).toEqual(["desk", "floor", "top", "shelf"]);
    expect(boxes[0]?.id).toBe("top");
  });
});
