import { ROOM_NAME_MAX_LENGTH } from "@/shared/constants/room";

export type RoomNameError = "emptyName" | "duplicateName" | "tooLong";
export type RoomNameCheck = { ok: true; name: string } | { ok: false; reason: RoomNameError };

/** 띄어쓰기·대소문자만 다른 이름은 같은 이름으로 본다 (검색에서 헷갈리지 않게). */
const normalize = (name: string) => name.replace(/\s+/g, "").toLowerCase();

/**
 * 구역 이름을 검사하고 앞뒤 공백을 지운 이름을 돌려준다.
 * except는 이름을 바꾸는 중인 구역이라 같은 이름 검사에서 뺀다.
 */
export function checkRoomName(rooms: string[], input: string, except?: string): RoomNameCheck {
  const name = input.trim();
  if (name === "") return { ok: false, reason: "emptyName" };
  // 이모지 등이 한 글자로 세어지게 글자 단위로 센다
  if ([...name].length > ROOM_NAME_MAX_LENGTH) return { ok: false, reason: "tooLong" };
  const others = rooms.filter((room) => room !== except);
  if (others.some((room) => normalize(room) === normalize(name))) {
    return { ok: false, reason: "duplicateName" };
  }
  return { ok: true, name };
}
