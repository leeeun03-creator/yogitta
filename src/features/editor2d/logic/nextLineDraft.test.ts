import { describe, expect, it } from "vitest";
import { nextLineDraft } from "./nextLineDraft";

const A = { x: 100, y: 100 };
const B = { x: 400, y: 100 };

describe("nextLineDraft", () => {
  it("첫 점을 누르면 그리기를 시작한다", () => {
    expect(nextLineDraft([], A)).toEqual({ draft: [A] });
  });

  it("둘째 점을 누르면 벽이 되고 그리기가 끝난다", () => {
    expect(nextLineDraft([A], B)).toEqual({ draft: [], wall: [A, B] });
  });

  it("엣지: 같은 자리를 또 누르면(길이 0) 벽을 만들지 않고 시작점을 그대로 둔다", () => {
    expect(nextLineDraft([A], { ...A })).toEqual({ draft: [A] });
  });
});
