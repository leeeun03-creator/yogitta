import type { AppData } from "@/shared/types";

/** 되돌리기 기록. past는 오래된 것부터, future는 다시하기할 것 (가까운 것이 맨 뒤). */
export type History = { past: readonly AppData[]; future: readonly AppData[] };

export const EMPTY_HISTORY: History = { past: [], future: [] };

/**
 * 데이터가 before → after로 바뀌었을 때 before를 기록한다. 가장 오래된 것부터 버려 limit개까지만 둔다.
 * 새로 바꾸면 다시하기 기록은 버린다. 바뀌지 않았으면(같은 객체) 기록하지 않는다.
 */
export function recordHistory(
  history: History,
  before: AppData,
  after: AppData,
  limit: number,
): History {
  if (before === after) return history;
  return { past: [...history.past, before].slice(-limit), future: [] };
}
