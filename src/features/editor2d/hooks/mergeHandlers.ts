import type { KeyboardEvent, PointerEvent } from "react";

type Pointer = (event: PointerEvent<HTMLElement>) => void;

/** 2D 평면도가 받는 이벤트 처리기 묶음. 도구·줌마다 필요한 것만 둔다. */
export type PlanHandlers = {
  onPointerDown?: Pointer;
  onPointerMove?: Pointer;
  onPointerUp?: Pointer;
  onPointerCancel?: Pointer;
  onPointerLeave?: Pointer;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

/** 여러 처리기 묶음을 하나로 합친다. 같은 이벤트는 넘긴 순서대로 모두 부른다. */
export function mergeHandlers(...parts: PlanHandlers[]): Required<PlanHandlers> {
  return {
    onPointerDown: (event) => parts.forEach((part) => part.onPointerDown?.(event)),
    onPointerMove: (event) => parts.forEach((part) => part.onPointerMove?.(event)),
    onPointerUp: (event) => parts.forEach((part) => part.onPointerUp?.(event)),
    onPointerCancel: (event) => parts.forEach((part) => part.onPointerCancel?.(event)),
    onPointerLeave: (event) => parts.forEach((part) => part.onPointerLeave?.(event)),
    onKeyDown: (event) => parts.forEach((part) => part.onKeyDown?.(event)),
  };
}
