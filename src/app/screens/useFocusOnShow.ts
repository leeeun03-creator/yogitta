import { useEffect, useRef } from "react";

/**
 * 화면이 바뀌어 나타날 때 그 화면 제목으로 초점을 옮긴다. 키보드·화면 읽기 프로그램이 새 화면 처음부터 시작하게 하고,
 * 누른 버튼 자리에 초점이 남아 Enter를 한 번 더 누르면 되돌아가 버리지 않게 한다.
 */
export function useFocusOnShow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => ref.current?.focus(), []);
  return ref;
}
