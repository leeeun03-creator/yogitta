import type { MetersError } from "./parseMeters";

const MESSAGES: Record<MetersError, string> = {
  empty: "크기를 적어 주세요",
  notNumber: "숫자로 적어 주세요 (예: 6.0)",
  tooSmall: "1m 이상으로 적어 주세요",
  tooLarge: "30m 이하로 적어 주세요",
};

/** 바닥 크기(m) 칸이 틀린 까닭을 화면 안내 문구로 바꾼다. 새 공간 만들기와 바닥 크기 바꾸기가 같이 쓴다. */
export function metersMessage(reason: MetersError): string {
  return MESSAGES[reason];
}
