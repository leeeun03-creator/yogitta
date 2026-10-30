import { useRef, type PointerEvent } from "react";
import type { Point } from "@/shared/types";
import { eventPoint } from "./eventPoint";
import { distance } from "@/shared/lib/distance";

type Gestures = {
  zoomBy: (factor: number, anchor: Point) => void;
  panByPx: (delta: Point) => void;
  // 누르기 시작한 자리(px)에서 끌면 이동하는지. 그리기 도구나 가구 위에서는 끌어서 그리거나 가구를 옮기므로 이동하지 않는다
  canPanFrom: (screen: Point) => boolean;
};

/** 손가락·마우스 하나로 끌면 이동(canPanFrom일 때), 두 손가락을 벌리거나 모으면 그 가운데를 붙잡고 줌한다. */
export function usePointerGestures({ zoomBy, panByPx, canPanFrom }: Gestures) {
  const pointers = useRef(new Map<number, Point>());
  const panning = useRef(new Set<number>()); // 끌면 이동하는 손가락·마우스

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const current = eventPoint(event);
    const others = [...pointers.current].filter(([id]) => id !== event.pointerId);
    pointers.current.set(event.pointerId, current);

    const other = others[0]?.[1];
    if (others.length === 0 && panning.current.has(event.pointerId)) {
      panByPx({ x: current.x - previous.x, y: current.y - previous.y });
    } else if (others.length === 1 && other) {
      const before = distance(previous, other);
      const middle = { x: (current.x + other.x) / 2, y: (current.y + other.y) / 2 };
      if (before > 0) zoomBy(distance(current, other) / before, middle);
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    panning.current.delete(event.pointerId);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      const point = eventPoint(event);
      pointers.current.set(event.pointerId, point);
      if (canPanFrom(point)) panning.current.add(event.pointerId);
    },
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
}
