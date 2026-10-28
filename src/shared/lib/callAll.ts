/** 같은 이벤트를 받는 처리기들을 차례로 모두 부르는 처리기 하나를 만든다. 비어 있는 자리는 건너뛴다. */
export function callAll<E>(...handlers: (((event: E) => void) | undefined)[]) {
  return (event: E) => {
    for (const handler of handlers) handler?.(event);
  };
}
