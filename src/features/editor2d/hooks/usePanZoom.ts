import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { FLOOR_PLAN_MARGIN_PX, KEYBOARD_PAN_PX, ZOOM_STEP } from "@/shared/constants/floorPlan";
import type { Floor, Point } from "@/shared/types";
import type { Size } from "../logic/fitViewBox";
import { panBy } from "../logic/panBy";
import { initialView, viewBoxOf } from "../logic/viewBoxOf";
import { zoomAt } from "../logic/zoomAt";
import { useElementSize } from "./useElementSize";
import { usePointerGestures } from "./usePointerGestures";
import { useWheelZoom } from "./useWheelZoom";

const KEY_PAN: Record<string, Point> = {
  ArrowLeft: { x: KEYBOARD_PAN_PX, y: 0 },
  ArrowRight: { x: -KEYBOARD_PAN_PX, y: 0 },
  ArrowUp: { x: 0, y: KEYBOARD_PAN_PX },
  ArrowDown: { x: 0, y: -KEYBOARD_PAN_PX },
};

/** 2D 평면도의 줌·이동: 휠, 끌기, 두 손가락 핀치, 키보드(+ - 0 방향키). */
export function usePanZoom(ref: RefObject<HTMLElement | null>, floor: Floor) {
  const viewport = useElementSize(ref);
  const [view, setView] = useState(() => initialView(floor));
  // 이벤트 처리기가 늘 최신 화면 크기·바닥을 보도록 그린 뒤에 담아 둔다
  const latest = useRef<{ viewport: Size; floor: Floor }>({ viewport, floor });
  useEffect(() => {
    latest.current = { viewport, floor };
  });

  // 한 프레임에 이벤트가 여러 번 와도 앞의 변경을 잃지 않게, 늘 바로 앞 View에서 이어서 계산한다
  const zoomBy = (factor: number, anchor: Point) =>
    setView((previous) => {
      const { viewport: size, floor: current } = latest.current;
      const box = viewBoxOf(current, size, FLOOR_PLAN_MARGIN_PX, previous);
      return zoomAt({ view: previous, box, viewport: size, floor: current }, factor, anchor);
    });
  const panByPx = (delta: Point) =>
    setView((previous) => {
      const { viewport: size, floor: current } = latest.current;
      const { cmPerPx } = viewBoxOf(current, size, FLOOR_PLAN_MARGIN_PX, previous);
      return panBy(previous, delta, cmPerPx, current);
    });

  useWheelZoom(ref, zoomBy);
  const pointerHandlers = usePointerGestures(ref, { zoomBy, panByPx });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const center = { x: viewport.width / 2, y: viewport.height / 2 };
    const pan = KEY_PAN[event.key];
    if (event.key === "+" || event.key === "=") zoomBy(ZOOM_STEP, center);
    else if (event.key === "-") zoomBy(1 / ZOOM_STEP, center);
    else if (event.key === "0") setView(initialView(floor));
    else if (pan) panByPx(pan);
    else return;
    event.preventDefault();
  };

  return {
    box: viewBoxOf(floor, viewport, FLOOR_PLAN_MARGIN_PX, view),
    handlers: { ...pointerHandlers, onKeyDown: handleKeyDown },
  };
}
