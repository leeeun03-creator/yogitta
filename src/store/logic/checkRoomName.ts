import { ROOM_NAME_MAX_LENGTH } from "@/shared/constants/room";
import { checkName, type NameCheck, type NameError } from "@/shared/lib/checkName";

export type RoomNameError = NameError;
export type RoomNameCheck = NameCheck;

/**
 * 구역 이름을 검사하고 앞뒤 공백을 지운 이름을 돌려준다.
 * except는 이름을 바꾸는 중인 구역이라 같은 이름 검사에서 뺀다.
 */
export function checkRoomName(rooms: string[], input: string, except?: string): RoomNameCheck {
  const others = rooms.filter((room) => room !== except);
  return checkName(others, input, ROOM_NAME_MAX_LENGTH);
}
