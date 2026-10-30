import { describe, expect, it } from "vitest";
import { slotLabels } from "./slotLabels";

describe("slotLabels", () => {
  it("서랍장·선반·벽걸이는 위 칸부터 n번째 서랍·선반·칸", () => {
    expect(slotLabels({ type: "drawer", rows: 3, cols: 1 })).toEqual([
      "1번째 서랍",
      "2번째 서랍",
      "3번째 서랍",
    ]);
    expect(slotLabels({ type: "shelf", rows: 2, cols: 1 })).toEqual(["1번째 선반", "2번째 선반"]);
    expect(slotLabels({ type: "wall", rows: 2, cols: 1 })).toEqual(["1번째 칸", "2번째 칸"]);
  });

  it("양문 수납장은 줄마다 왼쪽·오른쪽 문", () => {
    expect(slotLabels({ type: "cabinet", rows: 2, cols: 2 })).toEqual([
      "왼쪽 1번째 칸",
      "오른쪽 1번째 칸",
      "왼쪽 2번째 칸",
      "오른쪽 2번째 칸",
    ]);
  });

  it("침대·책상·테이블·보관함은 정해진 이름", () => {
    expect(slotLabels({ type: "bed", rows: 2, cols: 1 })).toEqual(["침대 위", "침대 밑"]);
    expect(slotLabels({ type: "desk", rows: 1, cols: 1 })).toEqual(["상판 위"]);
    expect(slotLabels({ type: "table", rows: 1, cols: 1 })).toEqual(["테이블 위"]);
    expect(slotLabels({ type: "box", rows: 1, cols: 1 })).toEqual(["보관함 안"]);
  });

  it("엣지: 칸 1개·8개", () => {
    expect(slotLabels({ type: "drawer", rows: 1, cols: 1 })).toEqual(["1번째 서랍"]);
    expect(slotLabels({ type: "shelf", rows: 8, cols: 1 }).at(-1)).toBe("8번째 선반");
  });
});
