import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import { TAP_MOVE_PX } from "@/shared/constants/pointer";
import { GRID_SNAP_CM } from "@/shared/constants/grid";
import { boxFootprint } from "@/shared/lib/boxFootprint";
import { distance } from "@/shared/lib/distance";
import type { Box, Point, Space } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { findBoxAt } from "../logic/findBoxAt";
import { findWallPointAt } from "../logic/findWallPointAt";
import type { ViewBox } from "../logic/fitViewBox";
import { movedBoxCenter } from "../logic/movedBoxCenter";
import { nextBoxMove, type BoxMove } from "../logic/nextBoxMove";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";

type Drag = {
  pointerId: number;
  box: Box; // 끄는 가구 (끌기 전)
  screen: Point; // 누른 자리 (px)
  move: BoxMove | null; // 옮길 자리와 받침 가구. 누르기 거리보다 멀리 끌기 전에는 null
};

/** 누른 자리(px)에 가구가 있으면 그 가구 끌기를 시작한다. 벽 점 위면 벽 점 끌기가 먼저라 시작하지 않는다. */
function startDrag(pointerId: number, screen: Point, view: ViewBox, space: Space): Drag | null {
  const at = screenToCm(screen, view);
  if (findWallPointAt(space.walls, at, POINT_HIT_PX * view.cmPerPx)) return null;
  const hit = findBoxAt(space.boxes, at);
  return hit && { pointerId, box: hit, screen, move: null };
}

/**
 * 지금 손가락·마우스 자리(px)까지 끈 가구 자리. 누르기 거리를 넘기 전에는 그대로 둔다.
 * 바로 앞 자리에서 이어서 옮겨(nextBoxMove), 다른 가구 위로 끌면 올라가고 밖으로 끌면 내려오며,
 * 벽·높이가 겹치는 가구는 뚫지 않고 면에 붙어 미끄러진다.
 */
function followDrag(
  drag: Drag,
  screen: Point,
  view: ViewBox,
  space: Space,
  gridStep: number | null,
): Drag {
  if (drag.move === null && distance(screen, drag.screen) <= TAP_MOVE_PX) return drag;
  const { box } = drag;
  const origin = { x: box.x, y: box.z }; // 2D y = 3D z
  const delta = {
    x: (screen.x - drag.screen.x) * view.cmPerPx,
    y: (screen.y - drag.screen.y) * view.cmPerPx,
  };
  const size = boxFootprint(box);
  const target = movedBoxCenter({ origin, delta, size, gridStep, floor: space.floor });
  const previous = drag.move ?? { center: origin, parentId: box.parentId ?? null };
  return { ...drag, move: nextBoxMove({ box, space, previous, target }) };
}

/**
 * 선택 도구로 가구를 끌어 옮긴다(다른 가구 위로 올리기·내리기 포함, T29). 끄는 동안은 그려 보이기만 하고,
 * 떼면 한 번에 옮겨(되돌리기 한 번) 그 가구를 고른다.
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
      setDrag(isOne ? startDrag(event.pointerId, eventPoint(event), view, space) : null);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag && isMine(event))
        setDrag(followDrag(drag, eventPoint(event), view, space, gridStep));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (drag?.move && isMine(event)) {
        moveBox(drag.box.id, drag.move.center, drag.move.parentId);
        selectBox(drag.box.id);
      }
      end(event);
    },
    onPointerCancel: end,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };

  return { moving: drag?.move ? { id: drag.box.id, ...drag.move } : null, handlers };
}
