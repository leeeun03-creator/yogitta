import { useEffect, type RefObject } from "react";

/**
 * 입력칸을 닫은 뒤 초점을 둘 구역 칩 (없으면 옮기지 않는다).
 * 같은 칩이어도 매번 새 객체라 초점 옮기기가 다시 돈다.
 */
export type RoomFocusTarget = { room?: string };

/** 구역 입력칸을 닫으면 초점을 그 구역 칩으로 돌려 키보드로 이어서 할 수 있게 한다. */
export function useRoomFocus(listRef: RefObject<HTMLElement | null>, target?: RoomFocusTarget) {
  useEffect(() => {
    if (!target?.room) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-room]");
    [...(buttons ?? [])].find((button) => button.dataset.room === target.room)?.focus();
  }, [listRef, target]);
}
