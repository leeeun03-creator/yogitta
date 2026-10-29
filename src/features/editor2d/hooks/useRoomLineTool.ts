import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { ROOM_LINE_ATTACH_CM } from "@/shared/constants/room";
import type { Floor, Point } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { attachRoomLineEnds } from "../logic/attachRoomLineEnds";
import type { SegmentLine } from "../logic/findSegment";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { simplifyRoomLine } from "../logic/simplifyRoomLine";
import { eventPoint } from "./eventPoint";

type Drag = { pointerId: number; points: Point[] };

/**
 * 구역 선 도구: 누른 채 끌면 손 가는 대로 선을 그리고, 떼면 점을 줄이고 끝을 가까운 경계에 붙여 저장한다.
 * 스냅하지 않는다(자유 곡선). 두 번째 손가락·Esc는 취소, 20cm보다 짧으면 버린다.
 */
export function useRoomLineTool(
  tool: DrawingTool,
  box: ViewBox,
  floor: Floor,
  lines: readonly SegmentLine[], // 끝을 붙일 벽·구역 선
) {
  const addRoomLine = useAppStore((state) => state.addRoomLine);
  const [drag, setDrag] = useState<Drag | null>(null);
  const floorPoint = (event: PointerEvent<HTMLElement>) => screenToCm(eventPoint(event), box);
  const isMine = (event: PointerEvent<HTMLElement>) => drag?.pointerId === event.pointerId;

  const finish = (points: Point[]) => {
    const line = simplifyRoomLine(points, floor);
    if (line) addRoomLine(attachRoomLineEnds(line, floor, lines, ROOM_LINE_ATTACH_CM));
  };
  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (tool !== "roomLine") return;
      // 끄는 중에 다른 손가락이 닿으면 핀치 줌으로 보고 그리던 선을 버린다
      setDrag(drag ? null : { pointerId: event.pointerId, points: [floorPoint(event)] });
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (drag && isMine(event)) setDrag({ ...drag, points: [...drag.points, floorPoint(event)] });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (!drag || !isMine(event)) return;
      finish([...drag.points, floorPoint(event)]);
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && drag) setDrag(null);
    },
  };

  return { draft: tool === "roomLine" && drag ? drag.points : [], handlers };
}
