import { useState, type KeyboardEvent, type RefObject } from "react";
import { FLOOR_PLAN_MARGIN_PX } from "@/shared/constants/floorPlan";
import type { Floor, Point } from "@/shared/types";
import { keyboardAction } from "../logic/keyboardAction";
import { panBy } from "../logic/panBy";
import { initialView, viewBoxOf } from "../logic/viewBoxOf";
import { zoomAt } from "../logic/zoomAt";
import { useElementSize } from "./useElementSize";
import { useLatest } from "./useLatest";
import { usePointerGestures } from "./usePointerGestures";
import { useWheelZoom } from "./useWheelZoom";

/** 2D 평면도의 줌·이동: 휠, 끌기, 두 손가락 핀치, 키보드(+ - 0 방향키). */
export function usePanZoom(ref: RefObject<HTMLElement | null>, floor: Floor, canPan: boolean) {
  const viewport = useElementSize(ref);
  const [view, setView] = useState(() => initialView(floor));
  const latest = useLatest({ viewport, floor });

  // 한 프레임에 이벤트가 여러 번 와도 앞의 변경을 잃지 않게 늘 바로 앞 View에서 이어서 계산한다.
  // 줌은 anchor가 없으면(키보드 +/-) 화면 가운데를 붙잡는다.
  const zoomBy = (factor: number, anchor?: Point) =>
    setView((previous) => {
      const { viewport: size, floor: current } = latest.current;
      const point = anchor ?? { x: size.width / 2, y: size.height / 2 };
      const box = viewBoxOf(current, size, FLOOR_PLAN_MARGIN_PX, previous);
      return zoomAt({ view: previous, box, viewport: size, floor: current }, factor, point);
    });
  const panByPx = (delta: Point) =>
    setView((previous) => {
      const { viewport: size, floor: current } = latest.current;
      const { cmPerPx } = viewBoxOf(current, size, FLOOR_PLAN_MARGIN_PX, previous);
      return panBy(previous, delta, cmPerPx, current);
    });

  useWheelZoom(ref, zoomBy);
  const pointerHandlers = usePointerGestures({ zoomBy, panByPx, canPan });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const action = keyboardAction(event.key);
    if (!action) return;
    event.preventDefault();
    if (action.type === "zoom") zoomBy(action.factor);
    else if (action.type === "pan") panByPx(action.delta);
    else setView(initialView(floor));
  };

  return {
    box: viewBoxOf(floor, viewport, FLOOR_PLAN_MARGIN_PX, view),
    handlers: { ...pointerHandlers, onKeyDown: handleKeyDown },
  };
}
