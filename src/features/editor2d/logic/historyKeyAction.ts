import type { HistoryDirection } from "@/store/useAppStore";

type KeyPress = {
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

/**
 * 되돌리기·다시하기 키. Ctrl+Z(Mac Cmd+Z)는 되돌리기, Ctrl+Shift+Z·Ctrl+Y는 다시하기.
 * 글자(key) 대신 자판 자리(code)로 봐서 한글 입력 상태("ㅋ")에서도 된다. 관계없는 키는 null.
 */
export function historyKeyAction({
  code,
  ctrlKey,
  metaKey,
  shiftKey,
  altKey,
}: KeyPress): HistoryDirection | null {
  if (!(ctrlKey || metaKey) || altKey) return null;
  if (code === "KeyZ") return shiftKey ? "redo" : "undo";
  if (code === "KeyY" && !shiftKey) return "redo";
  return null;
}
