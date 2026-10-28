import type { Point } from "@/shared/types";

type PositionedEvent = { clientX: number; clientY: number; currentTarget: EventTarget | null };

/** 이벤트 위치를 이벤트를 받은 요소(2D 평면도 영역) 왼쪽 위 기준 화면 좌표(px)로 바꾼다. */
export function eventPoint(event: PositionedEvent): Point {
  const rect =
    event.currentTarget instanceof Element ? event.currentTarget.getBoundingClientRect() : null;
  return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
}
