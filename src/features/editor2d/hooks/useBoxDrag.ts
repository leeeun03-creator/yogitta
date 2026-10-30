import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { TAP_MOVE_PX } from "@/shared/constants/floorPlan";
import { GRID_SNAP_CM } from "@/shared/constants/grid";
import { boxFootprint, type Footprint } from "@/shared/lib/boxFootprint";
import { distance } from "@/shared/lib/distance";
import type { Box, Floor, Point, Space } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { findBoxAt } from "../logic/findBoxAt";
import type { ViewBox } from "../logic/fitViewBox";
import { movedBoxCenter } from "../logic/movedBoxCenter";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";

type Drag = {
  pointerId: number;
  id: string; // 끄는 가구
  screen: Point; // 누른 자리 (px)
  origin: Point; // 끌기 전 가구 가운데 (cm)
  size: Footprint;
  center: Point | null; // 옮길 자리 (cm). 누르기 거리보다 멀리 끌기 전에는 null
};

/** 누른 자리(px)에 가구가 있으면 그 가구 끌기를 시작한다. */
function startDrag(pointerId: number, screen: Point, view: ViewBox, boxes: readonly Box[]) {
  const hit = findBoxAt(boxes, screenToCm(screen, view));
  if (!hit) return null;
  const origin = { x: hit.x, y: hit.z }; // 2D y = 3D z
  return { pointerId, id: hit.id, screen, origin, size: boxFootprint(hit), center: null };
}

/** 지금 손가락·마우스 자리(px)까지 끈 가구 가운데. 누르기 거리를 넘기 전에는 그대로 둔다. */
function followDrag(
  drag: Drag,
  screen: Point,
  view: ViewBox,
  floor: Floor,
  gridStep: number | null,
) {
  if (drag.center === null && distance(screen, drag.screen) <= TAP_MOVE_PX) return drag;
  const delta = {
    x: (screen.x - drag.screen.x) * view.cmPerPx,
    y: (screen.y - drag.screen.y) * view.cmPerPx,
  };
  return { ...drag, center: movedBoxCenter({ ...drag, delta, gridStep, floor }) };
}

/**
 * 선택 도구로 가구를 끌어 옮긴다. 끄는 동안은 그려 보이기만 하고, 떼면 한 번에 옮겨(되돌리기 한 번) 그 가구를 고른다.
 * 누르기 거리 안에서 떼면 옮기지 않는다(누르기로 고르기). 두 번째 손가락·Esc는 취소한다.
 */
export function useBoxDrag(tool: DrawingTool, view: ViewBox, space: Space) {
  const moveBox = useAppStore((state) => state.moveBox);
  const selectBox = useAppStore((state) => state.selectBox);
  const gridStep = useAppStore((state) => (state.ui.snap ? GRID_SNAP_CM : null));
  const [drag, setDrag] = useState<Drag | null>(null);
  const active = useRef(new Set<number>()); // 닿아 있는 손가락·마우스
  const isMine = (event: PointerEvent<HTMLElement>) => drag?.pointerId === event.pointerId;
  const end = (event: PointerEvent<HTMLElement>) => {
    active.current.delete(event.pointerId);
    setDrag(null);
  };

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      active.current.add(event.pointerId);
      if (tool !== "select") return;
      // 두 번째 손가락이 닿으면 핀치 줌으로 보고, 옮기던 가구는 제자리에 둔다
      const isOne = active.current.size === 1;
      setDrag(isOne ? startDrag(event.pointerId, eventPoint(event), view, space.boxes) : null);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag && isMine(event))
        setDrag(followDrag(drag, eventPoint(event), view, space.floor, gridStep));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (drag?.center && isMine(event)) {
        moveBox(drag.id, drag.center);
        selectBox(drag.id);
      }
      end(event);
    },
    onPointerCancel: end,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };

  return { moving: drag?.center ? { id: drag.id, center: drag.center } : null, handlers };
}
