import { useRef, useState, type PointerEvent } from "react";
import { TAP_MOVE_PX } from "@/shared/constants/floorPlan";
import { distance } from "@/shared/lib/distance";
import type { Point } from "@/shared/types";
import { eventPoint } from "./eventPoint";

type Drag = { pointerId: number; screen: Point; start: Point; isMoved: boolean };

/**
 * 손가락·마우스 하나로 누른 채 TAP_MOVE_PX보다 멀리 끌었다 떼면 onDrag(누른 점, 뗀 자리 px)를 알린다.
 * 누른 점(start)은 누를 때 toPoint로 바꿔 두고, 끄는 동안 start로 보여준다. 끌지 않았으면 누르기(useTap)에 맡긴다.
 */
export function useDrawDrag(
  isOn: boolean,
  toPoint: (screen: Point) => Point,
  onDrag: (start: Point, endScreen: Point) => void,
) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const active = useRef(new Set<number>());
  const isMine = (event: PointerEvent<HTMLElement>) => drag?.pointerId === event.pointerId;

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      active.current.add(event.pointerId);
      // 두 손가락이 닿으면 핀치 줌으로 보고 끌던 것을 버린다
      if (active.current.size > 1 || !isOn) {
        setDrag(null);
        return;
      }
      const screen = eventPoint(event);
      setDrag({ pointerId: event.pointerId, screen, start: toPoint(screen), isMoved: false });
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!drag || drag.isMoved || !isMine(event)) return;
      if (distance(eventPoint(event), drag.screen) > TAP_MOVE_PX)
        setDrag({ ...drag, isMoved: true });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      active.current.delete(event.pointerId);
      if (!drag || !isMine(event)) return;
      const end = eventPoint(event);
      // 한 번이라도 멀리 끌었으면 끌기다 (제자리로 돌아와 떼도 누르기가 아니다)
      if (isOn && (drag.isMoved || distance(end, drag.screen) > TAP_MOVE_PX))
        onDrag(drag.start, end);
      setDrag(null);
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      active.current.delete(event.pointerId);
      setDrag(null);
    },
  };

  return {
    start: isOn && drag?.isMoved ? drag.start : null,
    cancel: () => setDrag(null),
    handlers,
  };
}
