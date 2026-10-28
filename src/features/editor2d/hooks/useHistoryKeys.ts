import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { historyKeyAction } from "../logic/historyKeyAction";

/** 입력칸에 글자를 쓰는 중인지. 그때는 Ctrl+Z가 글자 되돌리기라 가로채지 않는다. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** 편집 모드 어디에 초점이 있든 Ctrl+Z는 되돌리기, Ctrl+Shift+Z·Ctrl+Y는 다시하기. */
export function useHistoryKeys() {
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = historyKeyAction(event);
      if (!action || isTyping(event.target)) return;
      event.preventDefault();
      if (action === "undo") undo();
      else redo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);
}
