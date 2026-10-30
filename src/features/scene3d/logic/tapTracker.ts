import { TAP_MOVE_PX } from "@/shared/constants/floorPlan";

/** 누르기 판정에 쓰는 포인터 이벤트 값 (PointerEvent와 같은 모양). */
export type TapEvent = Pick<
  PointerEvent,
  "pointerId" | "clientX" | "clientY" | "isPrimary" | "button"
>;

type Press = { pointerId: number; x: number; y: number };

const isFar = (event: TapEvent, from: Press) =>
  Math.hypot(event.clientX - from.x, event.clientY - from.y) > TAP_MOVE_PX;

/**
 * 누르기 하나를 따라가 누르기(탭)인지 가른다. 누른 자리에서 끄는 동안 한 번이라도 TAP_MOVE_PX를 넘게 움직이면
 * 끌기(3D 돌리기)라 제자리로 돌아와 떼도 누르기가 아니다. 두 번째 손가락이 닿거나(확대) 왼쪽 버튼이 아니면 취소한다.
 * 누르기면 onTap(떼기 이벤트)을 부른다.
 */
export function tapTracker<E extends TapEvent>(onTap: (event: E) => void) {
  let press: Press | null = null;
  return {
    pointerdown: (event: E) => {
      const { pointerId, clientX: x, clientY: y } = event;
      press = event.isPrimary && event.button === 0 ? { pointerId, x, y } : null;
    },
    pointermove: (event: E) => {
      if (press?.pointerId === event.pointerId && isFar(event, press)) press = null;
    },
    pointerup: (event: E) => {
      const start = press;
      press = null;
      if (start?.pointerId === event.pointerId && !isFar(event, start)) onTap(event);
    },
  };
}
