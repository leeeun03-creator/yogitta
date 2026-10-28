import { describe, expect, it } from "vitest";
import type { Wall } from "@/shared/types";
import { removeSegment } from "./removeSegment";

const P = (x: number, y: number) => ({ x, y });

/** 원본이 바뀌면 바로 에러가 나도록 깊게 얼린다. */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
const OPEN: Wall = {
  id: "wall_1",
  tool: "polyline",
  points: [P(0, 0), P(100, 0), P(100, 100), P(0, 100)], // 선분 0, 1, 2
  closed: false,
};
const RECT: Wall = { ...OPEN, tool: "rect", closed: true }; // 선분 0, 1, 2, 3 (3: 마지막 → 첫 점)

describe("removeSegment", () => {
  it("열린 벽 가운데 선분을 지우면 둘로 나뉜다 (뒤쪽은 새 id)", () => {
    expect(removeSegment(OPEN, 1, "wall_2")).toEqual([
      { id: "wall_1", tool: "line", points: [P(0, 0), P(100, 0)], closed: false },
      { id: "wall_2", tool: "line", points: [P(100, 100), P(0, 100)], closed: false },
    ]);
  });

  it("첫 선분을 지우면 앞이 짧아진다 (원래 id 유지)", () => {
    expect(removeSegment(OPEN, 0, "wall_2")).toEqual([
      {
        id: "wall_1",
        tool: "polyline",
        points: [P(100, 0), P(100, 100), P(0, 100)],
        closed: false,
      },
    ]);
  });

  it("마지막 선분을 지우면 뒤가 짧아진다", () => {
    expect(removeSegment(OPEN, 2, "wall_2")).toEqual([
      { id: "wall_1", tool: "polyline", points: [P(0, 0), P(100, 0), P(100, 100)], closed: false },
    ]);
  });

  it("선분 1개짜리 벽은 통째로 지워진다", () => {
    const line: Wall = { id: "wall_1", tool: "line", points: [P(0, 0), P(50, 0)], closed: false };
    expect(removeSegment(line, 0, "wall_2")).toEqual([]);
  });

  it("닫힌 사각형의 선분을 지우면 그 자리가 끝인 열린 연속선이 된다", () => {
    expect(removeSegment(RECT, 1, "wall_2")).toEqual([
      {
        id: "wall_1",
        tool: "polyline",
        points: [P(100, 100), P(0, 100), P(0, 0), P(100, 0)],
        closed: false,
      },
    ]);
  });

  it("닫힌 벽의 마지막 선분(마지막 → 첫 점)을 지우면 점 순서 그대로 열린다", () => {
    expect(removeSegment(RECT, 3, "wall_2")[0]?.points).toEqual(OPEN.points);
  });

  it.each([-1, 3, 1.5, Number.NaN])("엣지: 범위 밖 선분 번호(%s)는 그대로 둔다", (index) => {
    expect(removeSegment(OPEN, index, "wall_2")).toEqual([OPEN]);
  });

  it("원본 벽을 바꾸지 않는다", () => {
    const frozen = deepFreeze(structuredClone(OPEN));
    expect(() => removeSegment(frozen, 1, "wall_2")).not.toThrow();
    expect(frozen).toEqual(OPEN);
  });
});
