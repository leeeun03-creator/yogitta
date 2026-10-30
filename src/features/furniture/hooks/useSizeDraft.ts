import { useState } from "react";
import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { parseSize, type SizeDraft } from "../logic/parseSize";
import type { SizeError } from "../logic/sizeMessage";

const draftOf = (box: Pick<Box, "w" | "d" | "h">): SizeDraft => ({
  w: String(box.w),
  d: String(box.d),
  h: String(box.h),
});

/**
 * 크기 입력칸 셋의 글자와 막힌 까닭. save는 글자를 크기로 읽어 바꾸고(숫자가 아니거나 막히면 까닭만 남긴다),
 * cancel은 지금 크기로 돌린다. 글자를 고치면 까닭은 지운다.
 */
export function useSizeDraft(box: Box) {
  const resizeBox = useAppStore((state) => state.resizeBox);
  const [draft, setDraft] = useState(() => draftOf(box));
  const [error, setError] = useState<SizeError | null>(null);
  const save = () => {
    const size = parseSize(draft);
    if (!size) return setError("notNumber");
    const result = resizeBox(box.id, size);
    if (!result.ok) return setError(result.reason);
    setDraft(draftOf(size)); // "60.4" → "60"처럼 저장된 값으로 맞춘다
  };
  const cancel = () => {
    setDraft(draftOf(box));
    setError(null);
  };
  const change = (key: keyof SizeDraft, value: string) => {
    setDraft({ ...draft, [key]: value });
    setError(null);
  };
  return { draft, error, save, cancel, change };
}
