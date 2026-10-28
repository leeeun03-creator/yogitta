import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Floor, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { rectFromDrag } from "../logic/rectFromDrag";
import { toFloorPoint } from "../logic/toFloorPoint";
import { eventPoint } from "./eventPoint";

type Drag = { pointerId: number; start: Point; end: Point };

/** 사각형 도구: 끌어서 놓으면 닫힌 벽(선분 4개). 끄는 동안 미리보기, 두 번째 손가락·Esc는 취소. */
export function useRectTool(tool: DrawingTool, box: ViewBox, floor: Floor) {
  const addWall = useAppStore((state) => state.addWall);
  const [drag, setDrag] = useState<Drag | null>(null);
  const floorPoint = (event: PointerEvent<HTMLElement>) =>
    toFloorPoint(eventPoint(event), box, floor);
  const isMine = (event: PointerEvent<HTMLElement>) => drag?.pointerId === event.pointerId;

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (tool !== "rect") return;
      const point = floorPoint(event);
      // 끄는 중에 다른 손가락이 닿으면 핀치 줌으로 보고 그리던 사각형을 버린다
      setDrag(drag ? null : { pointerId: event.pointerId, start: point, end: point });
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag && isMine(event)) setDrag({ ...drag, end: floorPoint(event) });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (!drag || !isMine(event)) return;
      const points = rectFromDrag(drag.start, floorPoint(event));
      if (points) addWall({ tool: "rect", points, closed: true });
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };

  const points = tool === "rect" && drag ? rectFromDrag(drag.start, drag.end) : null;
  // 미리보기는 열린 선으로 그리므로 첫 점을 끝에 한 번 더 붙여 닫는다
  return { preview: points ? [...points, ...points.slice(0, 1)] : [], handlers };
}
