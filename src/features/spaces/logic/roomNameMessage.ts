import { ROOM_NAME_MAX_LENGTH } from "@/shared/constants/room";
import type { RoomNameError } from "@/store/useAppStore";

const MESSAGES: Record<RoomNameError, string> = {
  emptyName: "구역 이름을 써 주세요",
  duplicateName: "이미 있는 구역 이름이에요",
  tooLong: `구역 이름은 ${ROOM_NAME_MAX_LENGTH}자까지 쓸 수 있어요`,
};

/** 구역 이름이 막힌 까닭을 화면 안내 문구로 바꾼다. */
export function roomNameMessage(reason: RoomNameError): string {
  return MESSAGES[reason];
}
