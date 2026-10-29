import { useEffect, type RefObject } from "react";
import type { RoomFocusTarget } from "./useRoomForm";

/** 구역 입력칸을 닫으면 초점을 그 구역 칩이나 "+ 구역 추가"로 돌려 키보드로 이어서 할 수 있게 한다. */
export function useRoomFocus(listRef: RefObject<HTMLElement | null>, target?: RoomFocusTarget) {
  useEffect(() => {
    if (!target) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-room]");
    const chip = [...(buttons ?? [])].find((button) => button.dataset.room === target.room);
    const add = listRef.current?.querySelector<HTMLButtonElement>("button[data-add]");
    (chip ?? add)?.focus();
  }, [listRef, target]);
}
