import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * 공간 전환 목록 열기·닫기. 알약을 다시 누르거나 Esc를 누르면 닫고 초점을 알약으로 돌린다.
 * 바깥을 누르면 그냥 닫는다 (누른 곳으로 초점이 가게).
 */
export function useSpaceListPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const isInside = event.target instanceof Node && rootRef.current?.contains(event.target);
      if (!isInside) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const focusButton = () => buttonRef.current?.focus();
  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) focusButton();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !isOpen) return;
    event.stopPropagation();
    close(true);
  };

  const toggle = () => setIsOpen(!isOpen);
  return { isOpen, rootRef, buttonRef, toggle, close, focusButton, handleKeyDown };
}
