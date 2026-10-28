import { describe, expect, it } from "vitest";
import { moveHistory } from "./moveHistory";
import { createWallTestData } from "./wallFixtures";

const a = createWallTestData();
const b = createWallTestData();
const c = createWallTestData();

describe("moveHistory", () => {
  it("되돌리기: past 맨 뒤 데이터로 가고, 지금 데이터는 future에 쌓는다", () => {
    expect(moveHistory({ past: [a, b], future: [] }, c, "undo")).toEqual({
      data: b,
      history: { past: [a], future: [c] },
    });
  });

  it("다시하기: future 맨 뒤 데이터로 가고, 지금 데이터는 past에 쌓는다", () => {
    const result = moveHistory({ past: [a], future: [c] }, b, "redo");
    expect(result?.data).toBe(c);
    expect(result?.history).toEqual({ past: [a, b], future: [] });
  });

  it("되돌린 다음 다시하면 처음 상태로 돌아온다", () => {
    const undone = moveHistory({ past: [a, b], future: [] }, c, "undo");
    if (!undone) throw new Error("되돌릴 수 있어야 한다");
    const redone = moveHistory(undone.history, undone.data, "redo");
    expect(redone?.data).toBe(c);
    expect(redone?.history).toEqual({ past: [a, b], future: [] });
  });

  it("엣지: 처음에서 되돌리기·끝에서 다시하기는 null", () => {
    expect(moveHistory({ past: [], future: [a] }, b, "undo")).toBeNull();
    expect(moveHistory({ past: [a], future: [] }, b, "redo")).toBeNull();
  });

  it("엣지: 원본 기록을 바꾸지 않는다", () => {
    const history = Object.freeze({ past: Object.freeze([a, b]), future: Object.freeze([]) });
    expect(() => moveHistory(history, c, "undo")).not.toThrow();
    expect(history.past).toHaveLength(2);
  });
});
