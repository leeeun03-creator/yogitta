import { describe, expect, it } from "vitest";
import { isAutoName } from "./isAutoName";

describe("isAutoName", () => {
  it("종류 이름 + 띄어쓰기 + 1부터 시작하는 번호면 자동 이름이다", () => {
    expect(isAutoName("보관함 1", "보관함")).toBe(true);
    expect(isAutoName("양문 수납장 12", "양문 수납장")).toBe(true);
  });

  it("엣지: 다른 종류·번호 없음·0으로 시작·글자 섞임·앞에 다른 말은 아니다", () => {
    for (const name of [
      "서랍장 1",
      "보관함",
      "보관함 ",
      "보관함 0",
      "보관함 01",
      "보관함 1a",
      "내 보관함 1",
      "보관함1",
    ]) {
      expect(isAutoName(name, "보관함"), name).toBe(false);
    }
  });
});
