import { useEffect, type RefObject } from "react";
import { ZOOM_STEP } from "@/shared/constants/floorPlan";
import type { Point } from "@/shared/types";
import { eventPoint } from "./eventPoint";
import { useLatest } from "./useLatest";

/** 휠을 올리면 커서 아래를 붙잡고 확대, 내리면 축소한다. 페이지는 스크롤되지 않는다. */
export function useWheelZoom(
  ref: RefObject<HTMLElement | null>,
  zoomBy: (factor: number, anchor: Point) => void,
) {
  const zoomRef = useLatest(zoomBy);

  // React의 onWheel은 passive라 페이지 스크롤을 막을 수 없어서 직접 단다
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomRef.current(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, eventPoint(event));
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [ref, zoomRef]);
}
