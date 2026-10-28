import { describe, expect, it } from "vitest";
import { callAll } from "./callAll";

describe("callAll", () => {
  it("처리기들을 넣은 순서대로 같은 이벤트로 부른다", () => {
    const calls: string[] = [];
    callAll<string>(
      (event) => calls.push(`a:${event}`),
      (event) => calls.push(`b:${event}`),
    )("누름");
    expect(calls).toEqual(["a:누름", "b:누름"]);
  });

  it("비어 있는 자리는 건너뛴다", () => {
    const calls: string[] = [];
    callAll<string>(undefined, (event) => calls.push(event))("x");
    expect(calls).toEqual(["x"]);
  });
});
