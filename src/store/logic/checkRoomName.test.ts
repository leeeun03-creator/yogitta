import { describe, expect, it } from "vitest";
import { checkRoomName } from "./checkRoomName";

describe("checkRoomName", () => {
  it("앞뒤 공백을 지운 이름을 돌려준다", () => {
    expect(checkRoomName([], "  안방 ")).toEqual({ ok: true, name: "안방" });
  });

  it("엣지: 빈 이름·공백만은 막는다", () => {
    expect(checkRoomName([], "")).toEqual({ ok: false, reason: "emptyName" });
    expect(checkRoomName([], "   ")).toEqual({ ok: false, reason: "emptyName" });
  });

  it("엣지: 같은 이름은 막고, 띄어쓰기·대소문자만 다른 것도 같은 이름이다", () => {
    const rooms = ["안방", "Kitchen"];
    for (const name of ["안방", "안 방", " 안방", "kitchen", "KIT CHEN"]) {
      expect(checkRoomName(rooms, name)).toEqual({ ok: false, reason: "duplicateName" });
    }
  });

  it("엣지: 이름을 바꾸는 중인 구역 자신과는 겹쳐도 된다", () => {
    expect(checkRoomName(["안방", "거실"], "안 방", "안방")).toEqual({ ok: true, name: "안 방" });
    expect(checkRoomName(["안방", "거실"], "거실", "안방")).toEqual({
      ok: false,
      reason: "duplicateName",
    });
  });

  it("엣지: 10자까지 되고 11자는 막는다 (이모지는 한 글자)", () => {
    expect(checkRoomName([], "가".repeat(10))).toEqual({ ok: true, name: "가".repeat(10) });
    expect(checkRoomName([], "가".repeat(11))).toEqual({ ok: false, reason: "tooLong" });
    expect(checkRoomName([], "🛏".repeat(10)).ok).toBe(true);
  });

  it("엣지: 숫자·영어·숫자로 끝나는 이름도 된다", () => {
    for (const name of ["2층", "Room", "작은방2"]) expect(checkRoomName([], name).ok).toBe(true);
  });
});
