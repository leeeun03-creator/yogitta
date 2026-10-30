import type { Point } from "@/shared/types";

/** 가구에 하는 키보드 동작: 방향키로 한 칸 옮기기, R로 돌리기, Delete·Backspace로 지우기, Esc로 풀기. */
export type BoxKeyAction =
  | { type: "move"; direction: Point } // 한 칸 = 1, 2D y는 아래가 +
  | { type: "rotate" }
  | { type: "remove" }
  | { type: "deselect" };

type KeyInput = { key: string; code: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean };

const ARROW_DIRECTIONS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

/**
 * 누른 키를 가구 동작으로 바꾼다. 관계없는 키는 null.
 * R은 한글 입력 중이면 key가 "ㄱ"이라 자리(code)로 보고, Ctrl+R(새로고침) 같은 조합 키는 건드리지 않는다.
 */
export function boxKeyAction(event: KeyInput): BoxKeyAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  const direction = ARROW_DIRECTIONS[event.key];
  if (direction) return { type: "move", direction };
  if (event.code === "KeyR") return { type: "rotate" };
  if (event.key === "Delete" || event.key === "Backspace") return { type: "remove" };
  if (event.key === "Escape") return { type: "deselect" };
  return null;
}
