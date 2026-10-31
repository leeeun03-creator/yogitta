import { useState } from "react";
import { rowHeightsOf } from "@/shared/lib/rowHeightsOf";
import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { formatCm } from "../logic/formatCm";
import { parseCm } from "../logic/parseCm";
import type { RowHeightError } from "../logic/rowHeightMessage";

/** 막힌 까닭과 그 칸 번호. */
type DraftError = { row: number; reason: RowHeightError };

/**
 * 칸 높이 입력칸들의 글자와 막힌 까닭 (T30). save(row)는 그 칸 글자를 높이로 읽어 바꾸고(숫자가 아니거나 막히면
 * 까닭만 남긴다), 글자가 지금 높이 그대로면 아무것도 하지 않는다(균등 분배 소수를 반올림해 바꾸지 않게).
 * cancel은 모든 칸을 지금 높이로 돌린다. heights는 입력 중인 값으로 본 칸 높이다(합계·미리보기 막대용, 숫자가
 * 아닌 칸은 지금 높이). 칸 높이가 바뀌면 부르는 쪽에서 key로 새로 그린다.
 */
export function useRowHeightDraft(box: Box) {
  const changeRowHeight = useAppStore((state) => state.changeRowHeight);
  const savedHeights = rowHeightsOf(box);
  const saved = savedHeights.map(formatCm);
  const [drafts, setDrafts] = useState(saved);
  const [error, setError] = useState<DraftError | null>(null);
  const save = (row: number) => {
    const text = drafts[row] ?? "";
    if (text === saved[row]) return;
    const height = parseCm(text);
    if (height === null) return setError({ row, reason: "notNumber" });
    const result = changeRowHeight(box.id, row, height);
    if (!result.ok) setError({ row, reason: result.reason });
  };
  const cancel = () => {
    setDrafts(saved);
    setError(null);
  };
  const change = (row: number, value: string) => {
    setDrafts(drafts.map((draft, index) => (index === row ? value : draft)));
    setError(null);
  };
  const heights = drafts.map((draft, row) => {
    const current = savedHeights[row] ?? 0;
    return draft === saved[row] ? current : (parseCm(draft) ?? current);
  });
  return { drafts, heights, error, save, cancel, change };
}
