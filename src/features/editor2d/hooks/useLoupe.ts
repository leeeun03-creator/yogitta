import { useRef, useState, type PointerEvent } from "react";
import type { Point } from "@/shared/types";
import type { DrawingTool } from "@/store/useAppStore";
import { eventPoint } from "./eventPoint";

const LOUPE_TOOLS: readonly DrawingTool[] = ["line", "polyline", "rect", "roomLine"];

type Touch = { pointerId: number; point: Point };

/** 손가락 하나로 그리기 도구(직선·연속선·사각형·구역 선)를 누르고 있는 동안 손가락 자리(px). 마우스·두 손가락이면 null. */
export function useLoupe(tool: DrawingTool) {
  const [touch, setTouch] = useState<Touch | null>(null);
  const active = useRef(new Set<number>());
  const isMine = (event: PointerEvent<HTMLElement>) => touch?.pointerId === event.pointerId;
  const end = (event: PointerEvent<HTMLElement>) => {
    active.current.delete(event.pointerId);
    if (isMine(event)) setTouch(null);
  };

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      active.current.add(event.pointerId);
      const isOne = active.current.size === 1 && event.pointerType === "touch";
      setTouch(isOne ? { pointerId: event.pointerId, point: eventPoint(event) } : null);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isMine(event)) setTouch({ pointerId: event.pointerId, point: eventPoint(event) });
    },
    onPointerUp: end,
    onPointerCancel: end,
  };

  return { finger: LOUPE_TOOLS.includes(tool) ? (touch?.point ?? null) : null, handlers };
}
