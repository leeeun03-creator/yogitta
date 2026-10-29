import type { Floor } from "@/shared/types";
import type { SegmentLine } from "./findSegment";

/** 바닥 테두리 네 변을 닫힌 선 하나로. 구역 선 끝은 벽처럼 테두리에도 닿는다. */
export function floorEdges(floor: Floor): SegmentLine {
  const corners = [
    { x: 0, y: 0 },
    { x: floor.w, y: 0 },
    { x: floor.w, y: floor.h },
    { x: 0, y: floor.h },
  ];
  return { id: "floor", points: corners, closed: true };
}
