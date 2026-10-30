import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { TAP_MOVE_PX } from "@/shared/constants/pointer";
import { GRID_SNAP_CM } from "@/shared/constants/grid";
import { distance } from "@/shared/lib/distance";
import type { BoxPlacement } from "@/shared/lib/fitBoxPlacement";
import { isPlacementBlocked } from "@/shared/lib/isPlacementBlocked";
import type { Floor, Point, Space } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { boxFromDrag } from "../logic/boxFromDrag";
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

/** 끄는 중인 가구 미리보기. 벽·다른 가구에 파고드는 자리면 isBlocked (삭제색, 떼도 놓이지 않는다). */
export type BoxDraft = BoxPlacement & { isBlocked: boolean };

const BLOCKED_MESSAGE = "벽이나 다른 가구와 겹치는 자리예요";

const isOnFloor = (point: Point, floor: Floor) =>
  point.x >= 0 && point.x <= floor.w && point.y >= 0 && point.y <= floor.h;

/** 뗀 자리(px)에 놓을 가구. 누르기 거리 안에서 뗐으면 누른 자리에 기본 크기, 끌었으면 끈 사각형이다. */
function placementOf(drag: Drag, screen: Point, snapAt: SnapAt, gridStep: number | null) {
  if (distance(screen, drag.screen) <= TAP_MOVE_PX) return defaultBoxAt(drag.raw, gridStep);
  return boxFromDrag(drag.start, snapAt(screen).point);
}

/** 끄는 중인 미리보기. 누른 자리에서 아직 안 끌었으면(붙인 자리가 같음) 띄우지 않는다. */
function draftOf(drag: Drag | null, space: Space): BoxDraft | null {
  if (!drag || (drag.start.x === drag.end.x && drag.start.y === drag.end.y)) return null;
  const placement = boxFromDrag(drag.start, drag.end);
  return { ...placement, isBlocked: isPlacementBlocked(placement, space) };
}

/**
 * 가구 도구: 끌어서 놓으면 그 크기의 보관함, 누르기만 하면 그 자리에 기본 크기 보관함.
 * 놓은 가구는 바로 고쳐 쓸 수 있게 고르고 선택 도구로 바꾼다. 벽·다른 가구와 겹치는 자리면 놓지 않고 안내(notify)한다.
 * 끄는 동안 미리보기, 바닥 밖에서 누르기 시작하면 무시하고, 두 번째 손가락·Esc는 취소한다.
 */
export function useBoxTool(
  tool: DrawingTool,
  box: ViewBox,
  space: Space,
  { snapAt, notify }: { snapAt: SnapAt; notify: (message: string) => void },
) {
  const place = usePlaceBox(notify);
  const gridStep = useAppStore((state) => (state.ui.snap ? GRID_SNAP_CM : null));
  const [drag, setDrag] = useState<Drag | null>(null);
  const isMine = (event: PointerEvent<HTMLElement>) => drag?.pointerId === event.pointerId;
  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (tool !== "box") return;
      const screen = eventPoint(event);
      const raw = screenToCm(screen, box);
      const start = snapAt(screen).point;
      // 끄는 중에 다른 손가락이 닿으면 핀치 줌으로 보고 놓던 가구를 버린다
      const isNew = !drag && isOnFloor(raw, space.floor);
      setDrag(isNew ? { pointerId: event.pointerId, screen, raw, start, end: start } : null);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag && isMine(event)) setDrag({ ...drag, end: snapAt(eventPoint(event)).point });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (!drag || !isMine(event)) return;
      place(placementOf(drag, eventPoint(event), snapAt, gridStep));
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };
  return { draft: tool === "box" ? draftOf(drag, space) : null, handlers };
}

/** 가구를 놓는다. 놓은 가구는 바로 고쳐 쓸 수 있게 고르고 선택 도구로 바꾸고, 겹치는 자리라 못 놓으면 안내한다. */
function usePlaceBox(notify: (message: string) => void) {
  const addBox = useAppStore((state) => state.addBox);
  const setTool = useAppStore((state) => state.setTool);
  const selectBox = useAppStore((state) => state.selectBox);
  return (placement: BoxPlacement) => {
    const id = addBox(placement);
    if (id === null) {
      notify(BLOCKED_MESSAGE);
      return;
    }
    setTool("select");
    selectBox(id);
  };
}
