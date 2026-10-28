import { useRef, type PointerEvent, type RefObject } from "react";
import type { Point } from "@/shared/types";

type Gestures = {
  zoomBy: (factor: number, anchor: Point) => void;
  panByPx: (delta: Point) => void;
  canPan: boolean; // 그리기 도구일 때는 손가락·마우스 하나로 그리므로 끌어서 이동하지 않는다
};

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 손가락·마우스 하나로 끌면 이동(canPan일 때), 두 손가락을 벌리거나 모으면 그 가운데를 붙잡고 줌한다. */
export function usePointerGestures(
  ref: RefObject<HTMLElement | null>,
  { zoomBy, panByPx, canPan }: Gestures,
) {
  const pointers = useRef(new Map<number, Point>());

  const localPoint = (event: PointerEvent<HTMLElement>): Point => {
    const rect = ref.current?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const current = localPoint(event);
    const others = [...pointers.current].filter(([id]) => id !== event.pointerId);
    pointers.current.set(event.pointerId, current);

    const other = others[0]?.[1];
    if (others.length === 0 && canPan) {
      panByPx({ x: current.x - previous.x, y: current.y - previous.y });
    } else if (others.length === 1 && other) {
      const before = distance(previous, other);
      const middle = { x: (current.x + other.x) / 2, y: (current.y + other.y) / 2 };
      if (before > 0) zoomBy(distance(current, other) / before, middle);
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.set(event.pointerId, localPoint(event));
    },
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
}
