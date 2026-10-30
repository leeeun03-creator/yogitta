import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { POINT_HIT_PX, TAP_MOVE_PX } from "@/shared/constants/floorPlan";
import { distance } from "@/shared/lib/distance";
import { moveWallPoints } from "@/shared/lib/moveWallPoints";
import type { Point, Wall } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import type { ViewBox } from "../logic/fitViewBox";
import { findWallPointAt } from "../logic/findWallPointAt";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";
import type { SnapAt } from "./useSnapper";

const BLOCKED_MESSAGE = "가구와 겹치는 자리로는 벽을 옮길 수 없어요";

type Drag = {
  pointerId: number;
  screen: Point; // 누른 자리 (px), 누르기·끌기를 가른다
  from: Point; // 끄는 벽 점 (cm)
  to: Point | null; // 옮길 자리 (붙인 cm). 누르기 거리보다 멀리 끌기 전에는 null
};

/** 누른 자리(px) 가까이에 벽 점이 있으면 그 점 끌기를 시작한다. */
function startDrag(pointerId: number, screen: Point, view: ViewBox, walls: readonly Wall[]) {
  const hit = findWallPointAt(walls, screenToCm(screen, view), POINT_HIT_PX * view.cmPerPx);
  return hit ? { pointerId, screen, from: hit, to: null } : null;
}

type WallPointInput = { snapAt: SnapAt; walls: readonly Wall[]; notify: (message: string) => void };

/**
 * 선택 도구로 벽 점(연결점)을 끌어 옮긴다. 끄는 동안은 옮긴 벽을 그려 보이기만 하고, 떼면 한 번에 옮긴다(되돌리기 한 번).
 * 같은 자리에 붙은 다른 벽의 점도 같이 옮긴다. 옆 점 위로 겹치면 그대로 두고, 가구를 지나가게 되면 그대로 두고 알린다.
 * 누르기 거리 안에서 떼면 옮기지 않는다. 두 번째 손가락·Esc는 취소한다.
 */
export function useWallPointDrag(tool: DrawingTool, view: ViewBox, input: WallPointInput) {
  const { snapAt, walls, notify } = input;
  const moveWallPoint = useAppStore((state) => state.moveWallPoint);
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
      const isOne = active.current.size === 1; // 두 번째 손가락은 핀치 줌이라 끌던 점을 버린다
      const start = startDrag(event.pointerId, eventPoint(event), view, walls);
      setDrag(tool === "select" && isOne ? start : null);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!drag || !isMine(event)) return;
      const screen = eventPoint(event);
      if (drag.to === null && distance(screen, drag.screen) <= TAP_MOVE_PX) return;
      setDrag({ ...drag, to: snapAt(screen).point });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (drag?.to && isMine(event)) {
        const result = moveWallPoint(drag.from, drag.to);
        if (!result.ok && result.reason === "blocked") notify(BLOCKED_MESSAGE);
      }
      end(event);
    },
    onPointerCancel: end,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };
  const preview = drag?.to ? moveWallPoints(walls, drag.from, drag.to) : null;
  return { walls: preview, isDragging: drag !== null, handlers };
}
