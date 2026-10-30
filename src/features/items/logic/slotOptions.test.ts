import { describe, expect, it } from "vitest";
import { slotOptions } from "./slotOptions";

describe("slotOptions", () => {
  it("칸 이름마다 칸 번호 글자를 값으로 두고, 맨 끝에 칸 없음(빈 글자)을 둔다", () => {
    expect(slotOptions({ type: "drawer", rows: 2, cols: 1 })).toEqual([
      { value: "0", label: "1번째 서랍" },
      { value: "1", label: "2번째 서랍" },
      { value: "", label: "칸 없음" },
    ]);
  });

  it("엣지: 칸이 하나인 보관함도 칸 없음을 고를 수 있다", () => {
    expect(slotOptions({ type: "box", rows: 1, cols: 1 })).toEqual([
      { value: "0", label: "보관함 안" },
      { value: "", label: "칸 없음" },
    ]);
  });
});
