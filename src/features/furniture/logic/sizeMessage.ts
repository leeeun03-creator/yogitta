import { BOX_MAX_HEIGHT_CM, BOX_MIN_SIZE_CM } from "@/shared/constants/furniture";
import type { ResizeBlock } from "@/shared/lib/resizedBox";

/** 크기를 못 바꾼 까닭: 크기 검사(`ResizeBlock`) + 숫자가 아님. */
export type SizeError = ResizeBlock | "notNumber";

const MESSAGES: Record<SizeError, string> = {
  notNumber: "크기는 숫자로 써 주세요",
  tooSmall: `${BOX_MIN_SIZE_CM}cm보다 작게 할 수 없어요`,
  tooTall: `높이는 ${BOX_MAX_HEIGHT_CM}cm까지예요`,
  tooLong: "바닥보다 길어서 이 크기로 바꿀 수 없어요",
  blocked: "벽이나 다른 가구와 겹쳐서 이 크기로 바꿀 수 없어요",
};

/** 크기를 못 바꾼 까닭을 화면 안내 문구로 바꾼다. */
export function sizeMessage(reason: SizeError): string {
  return MESSAGES[reason];
}
