import { describe, expect, it } from "vitest";
import { STACK_DESK, stackBox } from "./stackFixtures";
import { stackedOn } from "./stackedOn";

describe("stackedOn", () => {
  it("그 가구 위에 올린 가구를 두 층까지 모두 돌려주고, 받침 가구가 아니면 빈 목록이다", () => {
    const top = stackBox("top", { parentId: "desk" });
    const topmost = stackBox("topmost", { parentId: "top" });
    const boxes = [STACK_DESK, top, topmost, stackBox("floor")];
    expect(stackedOn(boxes, "desk").map((box) => box.id)).toEqual(["top", "topmost"]);
    expect(stackedOn(boxes, "floor")).toEqual([]);
  });
});
