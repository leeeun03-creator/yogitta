import type { BoxSize } from "@/shared/lib/resizedBox";
import { parseCm } from "./parseCm";

/** 크기 입력칸 글자 (가로·깊이·높이, cm). */
export type SizeDraft = Record<keyof BoxSize, string>;

/** 크기 입력칸 셋을 크기로. 하나라도 숫자가 아니면 null (범위 검사는 가구를 바꾸는 쪽에서 한다). */
export function parseSize(draft: SizeDraft): BoxSize | null {
  const w = parseCm(draft.w);
  const d = parseCm(draft.d);
  const h = parseCm(draft.h);
  return w === null || d === null || h === null ? null : { w, d, h };
}
