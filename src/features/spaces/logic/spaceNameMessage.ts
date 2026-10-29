import type { SpaceNameError } from "@/store/useAppStore";

const MESSAGES: Record<SpaceNameError, string> = {
  emptyName: "공간 이름을 적어 주세요",
  duplicateName: "이미 같은 이름의 공간이 있어요",
};

/** 공간 이름이 틀린 까닭을 화면 안내 문구로. 바닥 크기 카드와 공간 이름 바꾸기가 같이 쓴다. */
export function spaceNameMessage(error: SpaceNameError): string {
  return MESSAGES[error];
}
