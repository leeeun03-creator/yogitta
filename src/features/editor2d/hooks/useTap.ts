import { useRef, type PointerEvent } from "react";
import { TAP_MOVE_PX } from "@/shared/constants/pointer";
import type { Point } from "@/shared/types";
import { eventPoint } from "./eventPoint";
import { distance } from "@/shared/lib/distance";

type Press = { pointerId: number; start: Point; isCancelled: boolean };

/**
 * 손가락·마우스 하나로 누르고 거의 움직이지 않은 채 떼면 "누르기"로 보고 그 자리(px)를 알린다.
 * 한 번이라도 TAP_MOVE_PX보다 멀리 끌었거나 두 손가락이 닿았으면(핀치) 누르기가 아니다.
 */
export function useTap(onTap: (point: Point) => void) {
  const press = useRef<Press | null>(null);
  const active = useRef(new Set<number>());

  const end = (event: PointerEvent<HTMLElement>, isCancel: boolean) => {
    active.current.delete(event.pointerId);
    const current = press.current;
    if (active.current.size === 0) press.current = null;
    if (isCancel || !current || current.pointerId !== event.pointerId || current.isCancelled)
      return;
    const point = eventPoint(event);
    if (distance(point, current.start) <= TAP_MOVE_PX) onTap(point);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      active.current.add(event.pointerId);
      if (active.current.size === 1) {
        press.current = {
          pointerId: event.pointerId,
          start: eventPoint(event),
          isCancelled: false,
        };
      } else if (press.current) {
        press.current.isCancelled = true;
      }
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const current = press.current;
      if (!current || current.pointerId !== event.pointerId) return;
      if (distance(eventPoint(event), current.start) > TAP_MOVE_PX) current.isCancelled = true;
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => end(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => end(event, true),
  };
}
