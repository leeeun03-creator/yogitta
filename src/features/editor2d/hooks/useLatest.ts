import { useEffect, useRef } from "react";

/** 이벤트 처리기가 늘 최신 값을 보도록, 그린 뒤에 값을 ref에 담아 둔다. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
