import { BOX_MIN_SIZE_CM } from "@/shared/constants/furniture";
import type { RowHeightBlock } from "@/store/useAppStore";

/** 칸 높이를 못 바꾼 까닭: 칸 높이 검사(`RowHeightBlock`) + 숫자가 아님. */
export type RowHeightError = RowHeightBlock | "notNumber";

/** 칸 높이를 못 바꾼 까닭을 화면 안내 문구로 바꾼다. totalCm은 가구 전체 높이다. */
export function rowHeightMessage(reason: RowHeightError, totalCm: number): string {
  if (reason === "notNumber") return "칸 높이는 숫자로 써 주세요";
  if (reason === "tooSmall") return `칸 높이는 ${BOX_MIN_SIZE_CM}cm보다 작게 할 수 없어요`;
  return `칸 높이 합계가 전체 높이 ${totalCm}cm를 넘어요. 다른 칸을 먼저 줄여 주세요`;
}
