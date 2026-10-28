import { useRef, type PointerEvent, type RefObject } from "react";
import { TAP_MOVE_PX } from "@/shared/constants/floorPlan";
import type { Point } from "@/shared/types";

type Press = { pointerId: number; start: Point; multiTouch: boolean };

/** 손가락·마우스 하나로 누르고 거의 움직이지 않은 채 떼면 "누르기"로 보고 그 자리(px)를 알린다. 끌기·핀치는 무시한다. */
export function useTap(ref: RefObject<HTMLElement | null>, onTap: (point: Point) => void) {
  const press = useRef<Press | null>(null);
  const active = useRef(new Set<number>());

  const localPoint = (event: PointerEvent<HTMLElement>): Point => {
    const rect = ref.current?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
  };

  const end = (event: PointerEvent<HTMLElement>, isCancel: boolean) => {
    active.current.delete(event.pointerId);
    const current = press.current;
    if (active.current.size === 0) press.current = null;
    if (isCancel || !current || current.pointerId !== event.pointerId || current.multiTouch) return;
    const point = localPoint(event);
    const moved = Math.hypot(point.x - current.start.x, point.y - current.start.y);
    if (moved <= TAP_MOVE_PX) onTap(point);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      active.current.add(event.pointerId);
      if (active.current.size === 1) {
        press.current = { pointerId: event.pointerId, start: localPoint(event), multiTouch: false };
      } else if (press.current) {
        press.current.multiTouch = true; // 두 손가락이 닿으면 핀치로 보고 누르기를 취소한다
      }
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => end(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => end(event, true),
  };
}
