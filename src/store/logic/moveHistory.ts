import type { AppData } from "@/shared/types";
import type { History } from "./recordHistory";

export type HistoryDirection = "undo" | "redo";

/**
 * 되돌리기(undo)는 past 맨 뒤로, 다시하기(redo)는 future 맨 뒤로 간다. 지금 데이터는 반대쪽에 쌓는다.
 * 더 갈 곳이 없으면 null.
 */
export function moveHistory(
  history: History,
  current: AppData,
  direction: HistoryDirection,
): { history: History; data: AppData } | null {
  const from = direction === "undo" ? history.past : history.future;
  const to = direction === "undo" ? history.future : history.past;
  const data = from.at(-1);
  if (!data) return null;
  const moved = { from: from.slice(0, -1), to: [...to, current] };
  return {
    data,
    history:
      direction === "undo"
        ? { past: moved.from, future: moved.to }
        : { past: moved.to, future: moved.from },
  };
}
