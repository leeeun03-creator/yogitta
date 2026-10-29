import { useState, type PointerEvent } from "react";
import { POINT_HIT_PX } from "@/shared/constants/floorPlan";
import { WALL_THICKNESS_CM } from "@/shared/constants/scene";
import type { Point, RoomLine, Wall } from "@/shared/types";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import { findSegment, type SegmentHit } from "../logic/findSegment";
import type { ViewBox } from "../logic/fitViewBox";
import { screenToCm } from "../logic/screenToCm";
import { eventPoint } from "./eventPoint";

/** 지우개가 맞힌 것: 벽 선분 하나, 또는 구역 선 하나(통째로 지운다). */
type EraserHit = { kind: "wall"; hit: SegmentHit } | { kind: "roomLine"; hit: SegmentHit };

/** 지울 것 표시: 벽은 그 선분, 구역 선은 선 전체. */
export type Erasing = { wall: { from: Point; to: Point } | null; roomLine: Point[] | null };

const NOTHING: Erasing = { wall: null, roomLine: null };

/** 맞힌 것을 2D 평면도에 표시할 모양으로 바꾼다. */
function erasingOf(target: EraserHit | null, roomLines: readonly RoomLine[]): Erasing {
  if (!target) return NOTHING;
  if (target.kind === "wall") return { wall: target.hit, roomLine: null };
  const line = roomLines.find((candidate) => candidate.id === target.hit.lineId);
  return { wall: null, roomLine: line?.points ?? null };
}

/**
 * 지우개 도구: 올리면 지울 것을 표시하고, 누르면 지운다. 벽 선분이 먼저(벽 두께 절반 + 화면 8px 안),
 * 없으면 구역 선(화면 8px 안)을 통째로 지운다.
 */
export function useEraserTool(
  tool: DrawingTool,
  box: ViewBox,
  walls: readonly Wall[],
  roomLines: readonly RoomLine[],
) {
  const eraseSegment = useAppStore((state) => state.eraseSegment);
  const removeRoomLine = useAppStore((state) => state.removeRoomLine);
  const [hover, setHover] = useState<EraserHit | null>(null);
  const isActive = tool === "eraser";
  const lineRadius = POINT_HIT_PX * box.cmPerPx;
  // 바닥 경계로 붙이지 않은 좌표로 판정한다 (가장자리 근처에서 위치가 틀어지지 않게)
  const hitAt = (screen: Point): EraserHit | null => {
    const point = screenToCm(screen, box);
    const wall = findSegment(walls, point, WALL_THICKNESS_CM / 2 + lineRadius);
    if (wall) return { kind: "wall", hit: wall };
    const roomLine = findSegment(roomLines, point, lineRadius);
    return roomLine && { kind: "roomLine", hit: roomLine };
  };

  const tap = (screen: Point) => {
    if (!isActive) return;
    const target = hitAt(screen);
    if (target?.kind === "wall") eraseSegment(target.hit.lineId, target.hit.segment);
    if (target?.kind === "roomLine") removeRoomLine(target.hit.lineId);
    setHover(null);
  };

  const handlers = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isActive) setHover(hitAt(eventPoint(event)));
    },
    onPointerLeave: () => setHover(null),
  };

  return { erasing: erasingOf(isActive ? hover : null, roomLines), tap, handlers };
}
