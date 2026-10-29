import { useEffect, useRef } from "react";

/**
 * 나타나면 바로 여는 모달 대화상자. 연 버튼을 먼저 기억한 뒤 열고 firstRef에 초점을 둔다.
 * close()는 대화상자를 닫고 연 버튼으로 초점을 돌린다 (모달이 열려 있는 동안은 뒤 화면에 초점을 줄 수 없어서 닫은 뒤에).
 */
export function useModalDialog<T extends HTMLElement>() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstRef = useRef<T>(null);
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    opener.current = document.activeElement;
    dialogRef.current?.showModal();
    firstRef.current?.focus();
  }, []);
  const close = () => {
    dialogRef.current?.close();
    if (opener.current instanceof HTMLElement) opener.current.focus();
  };
  return { dialogRef, firstRef, close };
}
