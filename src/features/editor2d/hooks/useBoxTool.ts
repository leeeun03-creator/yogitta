import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { TAP_MOVE_PX } from "@/shared/constants/floorPlan";
import { GRID_SNAP_CM } from "@/shared/constants/grid";
import { distance } from "@/shared/lib/distance";
import type { Floor, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { boxFromDrag, type BoxPlacement } from "../logic/boxFromDrag";
import { defaultBoxAt } from "../logic/defaultBoxAt";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";
import type { SnapAt } from "./useSnapper";

type Drag = {
  pointerId: number;
  screen: Point; // 누른 자리 (px), 누르기·끌기를 가른다
  raw: Point; // 누른 자리 (cm, 붙이기 전)
  start: Point; // 붙인 누른 자리 (cm)
  end: Point; // 붙인 지금 자리 (cm)
};

const isOnFloor = (point: Point, floor: Floor) =>
  point.x >= 0 && point.x <= floor.w && point.y >= 0 && point.y <= floor.h;

/**
 * 가구 도구: 끌어서 놓으면 그 크기의 보관함, 누르기만 하면 그 자리에 기본 크기 보관함.
 * 끄는 동안 미리보기, 바닥 밖에서 누르기 시작하면 무시하고, 두 번째 손가락·Esc는 취소한다.
 */
export function useBoxTool(tool: DrawingTool, box: ViewBox, floor: Floor, snapAt: SnapAt) {
  const addBox = useAppStore((state) => state.addBox);
  const snap = useAppStore((state) => state.ui.snap);
  const [drag, setDrag] = useState<Drag | null>(null);
  const isMine = (event: PointerEvent<HTMLElement>) => drag?.pointerId === event.pointerId;

  const place = (current: Drag, screen: Point) => {
    const isTap = distance(screen, current.screen) <= TAP_MOVE_PX;
    addBox(
      isTap
        ? defaultBoxAt(current.raw, snap ? GRID_SNAP_CM : null)
        : boxFromDrag(current.start, snapAt(screen).point),
    );
  };

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (tool !== "box") return;
      const screen = eventPoint(event);
      const raw = screenToCm(screen, box);
      // 끄는 중에 다른 손가락이 닿으면 핀치 줌으로 보고 놓던 가구를 버린다
      if (drag || !isOnFloor(raw, floor)) {
        setDrag(null);
        return;
      }
      const start = snapAt(screen).point;
      setDrag({ pointerId: event.pointerId, screen, raw, start, end: start });
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag && isMine(event)) setDrag({ ...drag, end: snapAt(eventPoint(event)).point });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (!drag || !isMine(event)) return;
      place(drag, eventPoint(event));
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };

  // 누른 자리에서 아직 안 끌었으면(붙인 자리가 같음) 미리보기를 띄우지 않는다
  const isDragging =
    tool === "box" && drag && (drag.start.x !== drag.end.x || drag.start.y !== drag.end.y);
  const draft: BoxPlacement | null = isDragging ? boxFromDrag(drag.start, drag.end) : null;
  return { draft, handlers };
}
