import { describe, expect, it } from "vitest";
import { rectFromDrag } from "./rectFromDrag";

const P = (x: number, y: number) => ({ x, y });
const RECT = [P(100, 50), P(400, 50), P(400, 300), P(100, 300)];

describe("rectFromDrag", () => {
  it("왼쪽 위 → 오른쪽 아래로 끌면 시계 방향 점 4개", () => {
    expect(rectFromDrag(P(100, 50), P(400, 300))).toEqual(RECT);
  });

  it("엣지: 어느 방향으로 거꾸로 끌어도 같은 사각형", () => {
    expect(rectFromDrag(P(400, 300), P(100, 50))).toEqual(RECT);
    expect(rectFromDrag(P(400, 50), P(100, 300))).toEqual(RECT);
    expect(rectFromDrag(P(100, 300), P(400, 50))).toEqual(RECT);
  });

  it("엣지: 가로나 세로가 0이면 만들지 않는다", () => {
    expect(rectFromDrag(P(100, 50), P(100, 300))).toBeNull();
    expect(rectFromDrag(P(100, 50), P(400, 50))).toBeNull();
    expect(rectFromDrag(P(100, 50), P(100, 50))).toBeNull();
  });
});
