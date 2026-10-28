import { describe, expect, it } from "vitest";
import { panBy } from "./panBy";
import { initialView } from "./viewBoxOf";

const FLOOR = { w: 600, h: 450 };

describe("panBy", () => {
  it("오른쪽으로 끌면 바닥도 오른쪽으로 간다 (보는 중심은 왼쪽으로)", () => {
    const view = panBy(initialView(FLOOR), { x: 30, y: 0 }, 2, FLOOR);
    expect(view.center).toEqual({ x: 240, y: 225 });
  });

  it("아무리 멀리 끌어도 보는 중심은 바닥 안에 남는다", () => {
    const view = panBy(initialView(FLOOR), { x: 99999, y: -99999 }, 2, FLOOR);
    expect(view.center).toEqual({ x: 0, y: 450 });
  });
});
