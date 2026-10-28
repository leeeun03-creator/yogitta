import { describe, expect, it } from "vitest";
import { EMPTY_HISTORY, recordHistory } from "./recordHistory";
import { createWallTestData } from "./wallFixtures";

const wall = (id: string) => ({
  id,
  tool: "line" as const,
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  closed: false,
});

describe("recordHistory", () => {
  it("바뀌기 전 데이터를 past 맨 뒤에 쌓는다", () => {
    const a = createWallTestData();
    const b = createWallTestData([wall("w1")]);
    expect(recordHistory(EMPTY_HISTORY, a, b, 50)).toEqual({ past: [a], future: [] });
  });

  it("새로 바꾸면 다시하기 기록(future)을 버린다", () => {
    const a = createWallTestData();
    const b = createWallTestData([wall("w1")]);
    const history = { past: [], future: [b] };
    expect(recordHistory(history, a, b, 50).future).toEqual([]);
  });

  it("엣지: limit을 넘으면 가장 오래된 것부터 버린다 (51번째 → 50개)", () => {
    const steps = Array.from({ length: 51 }, (_, index) => createWallTestData([wall(`w${index}`)]));
    let history = EMPTY_HISTORY;
    steps.forEach((step, index) => {
      history = recordHistory(history, step, steps[index + 1] ?? createWallTestData(), 50);
    });
    expect(history.past).toHaveLength(50);
    expect(history.past[0]).toBe(steps[1]);
    expect(history.past.at(-1)).toBe(steps[50]);
  });

  it("엣지: 바뀌지 않았으면(같은 객체) 기록하지 않는다", () => {
    const a = createWallTestData();
    const history = { past: [], future: [a] };
    expect(recordHistory(history, a, a, 50)).toBe(history);
  });

  it("엣지: 원본 기록을 바꾸지 않는다", () => {
    const a = createWallTestData();
    const history = Object.freeze({ past: Object.freeze([a]), future: Object.freeze([]) });
    expect(() => recordHistory(history, a, createWallTestData(), 50)).not.toThrow();
    expect(history.past).toHaveLength(1);
  });
});
