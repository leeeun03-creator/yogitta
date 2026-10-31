import { BOX_MAX_HEIGHT_CM } from "@/shared/constants/furniture";
import type { ElevationBlock } from "@/store/useAppStore";

/** 설치 높이를 못 바꾼 까닭: 설치 높이 검사(`ElevationBlock`) + 숫자가 아님. */
export type ElevationError = ElevationBlock | "notNumber";

const MESSAGES: Record<ElevationError, string> = {
  notNumber: "설치 높이는 숫자로 써 주세요",
  tooLow: "설치 높이는 0cm보다 낮게 할 수 없어요",
  tooHigh: `설치 높이와 가구 높이를 더해 ${BOX_MAX_HEIGHT_CM}cm까지예요`,
  blocked: "아래나 위 가구와 높이가 겹쳐서 이 높이로 바꿀 수 없어요",
};

/** 설치 높이를 못 바꾼 까닭을 화면 안내 문구로 바꾼다 (T30-3). */
export function elevationMessage(reason: ElevationError): string {
  return MESSAGES[reason];
}
