import { useLayoutEffect, useState } from "react";

/**
 * 검색 결과 카드 자리가 3D 공간 왼쪽을 덮는 폭(px)을 잰다 (T15-2). 카드가 3D 위에 떠 있을 때(넓은 화면, absolute)만
 * 카드 오른쪽 끝까지이고, 휴대폰처럼 3D 아래에 있으면 0이다. isActive가 아니면(찾은 가구가 없음) 0.
 * 카드 크기·화면 폭이 바뀌면 다시 잰다.
 */
export function useCoverLeft(isActive: boolean) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const isFloating = getComputedStyle(element).position === "absolute";
      setWidth(isFloating ? element.offsetLeft + element.offsetWidth : 0);
    });
    observer.observe(element); // 처음 한 번은 바로 알려 준다
    return () => observer.disconnect();
  }, [element]);
  return { attachCard: setElement, coverLeft: isActive ? width : 0 }; // attachCard: 카드 자리 div의 ref로 단다
}
