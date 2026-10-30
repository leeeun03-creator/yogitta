import { describe, expect, it } from "vitest";
import { movedMessage } from "./movedMessage";

describe("movedMessage", () => {
  it("받침이 있으면 '을', 없으면 '를'을 붙인다", () => {
    expect(movedMessage("여권", "보관함 1")).toBe("여권을 보관함 1에 옮겼어요");
    expect(movedMessage("양말 세트 두 개", "책상")).toBe("양말 세트 두 개를 책상에 옮겼어요");
  });

  it("엣지: 숫자·영어로 끝나는 이름도 읽는 소리로 고른다", () => {
    expect(movedMessage("충전기 3", "선반 1")).toBe("충전기 3을 선반 1에 옮겼어요");
    expect(movedMessage("USB", "서랍장 2")).toBe("USB를 서랍장 2에 옮겼어요");
  });
});
