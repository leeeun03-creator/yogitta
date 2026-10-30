import type { BoxSize } from "@/shared/lib/resizedBox";

/** 크기 입력칸 글자 (가로·깊이·높이, cm). */
export type SizeDraft = Record<keyof BoxSize, string>;

/** cm 글자 하나를 정수 cm로. 소수는 반올림하고 쉼표 소수점도 받는다. 비었거나 숫자가 아니면 null. */
function parseCm(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? Math.round(value) : null;
}

/** 크기 입력칸 셋을 크기로. 하나라도 숫자가 아니면 null (범위 검사는 가구를 바꾸는 쪽에서 한다). */
export function parseSize(draft: SizeDraft): BoxSize | null {
  const w = parseCm(draft.w);
  const d = parseCm(draft.d);
  const h = parseCm(draft.h);
  return w === null || d === null || h === null ? null : { w, d, h };
}
